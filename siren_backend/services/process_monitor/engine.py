"""
ProcessService - Core business logic for process management

Provides high-level operations for:
- Enumerating all running processes with risk assessment
- Terminating processes safely
- Collecting system metrics in background thread
"""

import psutil
import threading
import time
import logging
from typing import List, Dict, Optional
from .risk_engine import RiskEngine
from .metrics_buffer import MetricsBuffer


logger = logging.getLogger(__name__)


class ProcessService:
    """
    Service for managing system processes.
    
    Provides methods to enumerate, analyze, and terminate processes
    with integrated risk assessment.
    """
    
    def __init__(self):
        """Initialize the process service with risk engine."""
        self.risk_engine = RiskEngine()
    
    def get_all_processes(self) -> Dict[str, any]:
        """
        Retrieve all running processes with risk scores.
        
        Returns:
            Dictionary containing:
                - processes: List of process dictionaries
                - summary: Overall system summary
        """
        processes = []
        high_risk_count = 0
        
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info', 'exe', 'username']):
            try:
                # Get process information
                pinfo = proc.info
                
                # Calculate memory in MB
                memory_mb = pinfo['memory_info'].rss / (1024 * 1024) if pinfo['memory_info'] else 0
                
                # Get executable path
                path = pinfo.get('exe', '') or ''
                
                # Get username
                username = pinfo.get('username', '') or 'unknown'
                
                # Build process info dict
                process_info = {
                    'pid': pinfo['pid'],
                    'name': pinfo['name'] or 'unknown',
                    'cpu_usage': pinfo['cpu_percent'] or 0.0,
                    'memory_usage': round(memory_mb, 2),
                    'path': path,
                    'username': username
                }
                
                # Calculate risk score
                risk_assessment = self.risk_engine.calculate_risk_score(process_info)
                
                # Merge risk data into process info
                process_info.update({
                    'risk_score': risk_assessment['risk_score'],
                    'risk_level': risk_assessment['risk_level'],
                    'risk_factors': risk_assessment['risk_factors']
                })
                
                processes.append(process_info)
                
                # Count high-risk processes
                if risk_assessment['risk_level'] == 'High':
                    high_risk_count += 1
                    
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess) as e:
                # Skip processes we can't access
                logger.debug(f"Skipped process due to: {e}")
                continue
        
        # Get system-level metrics
        cpu_percent = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory()
        
        summary = {
            'total': len(processes),
            'high_risk': high_risk_count,
            'cpu_percent': round(cpu_percent, 2),
            'memory_percent': round(memory.percent, 2)
        }
        
        return {
            'processes': processes,
            'summary': summary
        }
    
    def get_process_by_pid(self, pid: int) -> Optional[Dict]:
        """
        Get detailed information about a specific process.
        
        Args:
            pid: Process ID
        
        Returns:
            Process info dictionary or None if not found
        
        Raises:
            psutil.NoSuchProcess: If process doesn't exist
            psutil.AccessDenied: If access is denied
        """
        try:
            proc = psutil.Process(pid)
            pinfo = proc.as_dict(attrs=['pid', 'name', 'cpu_percent', 'memory_info', 'exe', 'username'])
            
            memory_mb = pinfo['memory_info'].rss / (1024 * 1024) if pinfo['memory_info'] else 0
            
            process_info = {
                'pid': pinfo['pid'],
                'name': pinfo['name'] or 'unknown',
                'cpu_usage': pinfo['cpu_percent'] or 0.0,
                'memory_usage': round(memory_mb, 2),
                'path': pinfo.get('exe', '') or '',
                'username': pinfo.get('username', '') or 'unknown'
            }
            
            # Add risk assessment
            risk_assessment = self.risk_engine.calculate_risk_score(process_info)
            process_info.update({
                'risk_score': risk_assessment['risk_score'],
                'risk_level': risk_assessment['risk_level'],
                'risk_factors': risk_assessment['risk_factors']
            })
            
            return process_info
            
        except psutil.NoSuchProcess:
            logger.warning(f"Process {pid} not found")
            raise
        except psutil.AccessDenied:
            logger.warning(f"Access denied to process {pid}")
            raise
    
    def kill_process(self, pid: int) -> Dict[str, any]:
        """
        Safely terminate a process.
        
        Args:
            pid: Process ID to terminate
        
        Returns:
            Dictionary with status, message, and pid
        
        Raises:
            psutil.NoSuchProcess: If process doesn't exist
            psutil.AccessDenied: If permission is denied
            psutil.TimeoutExpired: If termination times out
        """
        try:
            proc = psutil.Process(pid)
            process_name = proc.name()
            
            # Attempt graceful termination first
            proc.terminate()
            
            # Wait up to 3 seconds for process to terminate
            try:
                proc.wait(timeout=3)
            except psutil.TimeoutExpired:
                # Force kill if graceful termination fails
                logger.warning(f"Process {pid} ({process_name}) did not terminate gracefully, forcing kill")
                proc.kill()
                proc.wait(timeout=3)
            
            logger.info(f"Successfully terminated process {pid} ({process_name})")
            
            return {
                'status': 'success',
                'message': f'Process {pid} ({process_name}) terminated successfully',
                'pid': pid
            }
            
        except psutil.NoSuchProcess:
            logger.error(f"Cannot kill process {pid}: Process not found")
            raise
        except psutil.AccessDenied:
            logger.error(f"Cannot kill process {pid}: Access denied")
            raise
        except psutil.TimeoutExpired:
            logger.error(f"Process {pid} termination timed out")
            raise


class MetricsCollector:
    """
    Background thread for collecting system metrics.
    
    Samples CPU and memory usage every 1 second and stores in
    a circular buffer for the last 60 seconds.
    """
    
    def __init__(self, metrics_buffer: MetricsBuffer, interval: float = 1.0):
        """
        Initialize the metrics collector.
        
        Args:
            metrics_buffer: MetricsBuffer instance to store metrics
            interval: Sampling interval in seconds (default: 1.0)
        """
        self.metrics_buffer = metrics_buffer
        self.interval = interval
        self._stop_event = threading.Event()
        self._thread = None
    
    def start(self) -> None:
        """Start the background metrics collection thread."""
        if self._thread and self._thread.is_alive():
            logger.warning("Metrics collector already running")
            return
        
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._collect_metrics_loop, daemon=True)
        self._thread.start()
        logger.info("Metrics collector started")
    
    def stop(self) -> None:
        """Stop the background metrics collection thread."""
        if not self._thread or not self._thread.is_alive():
            logger.warning("Metrics collector not running")
            return
        
        self._stop_event.set()
        self._thread.join(timeout=5)
        logger.info("Metrics collector stopped")
    
    def is_running(self) -> bool:
        """Check if the collector is currently running."""
        return self._thread is not None and self._thread.is_alive()
    
    def _collect_metrics_loop(self) -> None:
        """
        Main loop for collecting metrics.
        
        Runs in a background thread, sampling system metrics every
        interval seconds until stopped.
        """
        logger.info("Starting metrics collection loop")
        
        while not self._stop_event.is_set():
            try:
                # Sample system metrics
                cpu_percent = psutil.cpu_percent(interval=0.1)
                memory = psutil.virtual_memory()
                
                # Store in buffer
                self.metrics_buffer.add_metric(cpu_percent, memory.percent)
                
                # Sleep until next sample
                self._stop_event.wait(self.interval)
                
            except Exception as e:
                logger.error(f"Error collecting metrics: {e}")
                # Continue on error rather than crashing
                time.sleep(self.interval)
        
        logger.info("Metrics collection loop stopped")
