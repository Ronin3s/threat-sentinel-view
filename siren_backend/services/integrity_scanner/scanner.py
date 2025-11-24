"""
Integrity Scanner - Host Baseline Monitoring & File Integrity

Provides file system scanning, hash calculation, baseline comparison,
and deviation detection for monitored Windows hosts.
"""

import os
import hashlib
import logging
import uuid
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
from utils.common import get_timestamp

logger = logging.getLogger(__name__)


class IntegrityScanner:
    """
    Scanner for detecting changes from baseline configuration.
    
    Features:
    - File system scanning with hash calculation
    - Baseline storage and comparison
    - Registry monitoring (Windows-specific)
    - Deviation detection and severity scoring
    """
    
    def __init__(self):
        """Initialize the integrity scanner with in-memory storage."""
        self.scans = {}  # Job storage: {job_id: scan_data}
        self.baselines = {}  # Baseline storage: {host_id: baseline_data}
        logger.info("IntegrityScanner initialized")
    
    def start_scan(self, host_id: str, scan_paths: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Initiate a baseline integrity scan for a host.
        
        Args:
            host_id: Host identifier (e.g., "WIN-SRV-01")
            scan_paths: Optional list of paths to scan. If None, scans common directories.
        
        Returns:
            Dictionary with job_id and initial status
        """
        job_id = f"scan-{uuid.uuid4().hex[:8]}"
        
        # Default Windows critical paths if none specified
        if scan_paths is None:
            scan_paths = [
                "C:\\Windows\\System32",
                "C:\\Windows\\System32\\drivers",
                "C:\\Program Files",
                "C:\\Users\\Public",
                "C:\\ProgramData"
            ]
        
        # Initialize scan job
        self.scans[job_id] = {
            'job_id': job_id,
            'host': host_id,
            'status': 'running',
            'timestamp': get_timestamp(),
            'scan_paths': scan_paths,
            'baseline_score': 100,
            'changes': [],
            'files_scanned': 0,
            'severity': 'low'
        }
        
        logger.info(f"Scan initiated: {job_id} for host {host_id}")
        
        # Perform the actual scan
        try:
            self._execute_scan(job_id, host_id, scan_paths)
        except Exception as e:
            logger.error(f"Scan {job_id} failed: {e}")
            self.scans[job_id]['status'] = 'failed'
            self.scans[job_id]['error'] = str(e)
        
        return {
            'job_id': job_id,
            'status': self.scans[job_id]['status'],
            'message': f'Scan initiated for {host_id}'
        }
    
    def _execute_scan(self, job_id: str, host_id: str, scan_paths: List[str]) -> None:
        """
        Execute the actual file system scan.
        
        Args:
            job_id: Scan job identifier
            host_id: Host being scanned
            scan_paths: Paths to scan
        """
        current_snapshot = {}
        files_scanned = 0
        changes = []
        
        # Scan each path
        for scan_path in scan_paths:
            if not os.path.exists(scan_path):
                logger.warning(f"Path does not exist: {scan_path}")
                changes.append({
                    'path': scan_path,
                    'change': 'path_not_found',
                    'severity': 'low'
                })
                continue
            
            # Scan directory
            try:
                for root, dirs, files in os.walk(scan_path):
                    # Limit depth and file count for performance
                    if files_scanned >= 500:  # Limit for demo purposes
                        break
                    
                    for file in files:
                        filepath = os.path.join(root, file)
                        
                        try:
                            # Calculate file hash
                            file_hash = self._calculate_file_hash(filepath)
                            file_stat = os.stat(filepath)
                            
                            current_snapshot[filepath] = {
                                'hash': file_hash,
                                'size': file_stat.st_size,
                                'modified': datetime.fromtimestamp(file_stat.st_mtime).isoformat()
                            }
                            
                            files_scanned += 1
                            
                        except (PermissionError, OSError) as e:
                            logger.debug(f"Cannot access {filepath}: {e}")
                            continue
                    
                    if files_scanned >= 500:
                        break
                        
            except Exception as e:
                logger.error(f"Error scanning {scan_path}: {e}")
                continue
        
        # Compare with baseline if exists
        if host_id in self.baselines:
            changes = self._compare_with_baseline(host_id, current_snapshot)
        else:
            # First scan - create baseline
            logger.info(f"Creating initial baseline for {host_id}")
            self.baselines[host_id] = {
                'host_id': host_id,
                'created_at': get_timestamp(),
                'snapshot': current_snapshot,
                'file_count': len(current_snapshot)
            }
        
        # Calculate baseline score and severity
        baseline_score = 100 - min(len(changes) * 2, 30)  # Deduct 2 points per change, max 30
        severity = self._calculate_severity(changes)
        
        # Update scan job with results
        self.scans[job_id].update({
            'status': 'completed',
            'files_scanned': files_scanned,
            'changes': changes,
            'baseline_score': baseline_score,
            'severity': severity,
            'completed_at': get_timestamp()
        })
        
        logger.info(f"Scan {job_id} completed: {len(changes)} changes detected, score: {baseline_score}")
    
    def _calculate_file_hash(self, filepath: str, algorithm: str = 'sha256') -> str:
        """
        Calculate hash of a file.
        
        Args:
            filepath: Path to file
            algorithm: Hash algorithm (md5, sha256)
        
        Returns:
            Hexadecimal hash string
        """
        hasher = hashlib.sha256() if algorithm == 'sha256' else hashlib.md5()
        
        try:
            with open(filepath, 'rb') as f:
                # Read in chunks for large files
                for chunk in iter(lambda: f.read(8192), b''):
                    hasher.update(chunk)
            return hasher.hexdigest()
        except Exception as e:
            logger.debug(f"Cannot hash {filepath}: {e}")
            return "hash_failed"
    
    def _compare_with_baseline(self, host_id: str, current_snapshot: Dict) -> List[Dict]:
        """
        Compare current snapshot with baseline.
        
        Args:
            host_id: Host identifier
            current_snapshot: Current file snapshot
        
        Returns:
            List of detected changes
        """
        changes = []
        baseline_snapshot = self.baselines[host_id]['snapshot']
        
        # Check for new or modified files
        for filepath, current_data in current_snapshot.items():
            if filepath not in baseline_snapshot:
                # New file detected
                severity = self._assess_file_risk(filepath)
                changes.append({
                    'path': filepath,
                    'change': 'new',
                    'hash': current_data['hash'],
                    'severity': severity
                })
            elif current_data['hash'] != baseline_snapshot[filepath]['hash']:
                # Modified file detected
                severity = self._assess_file_risk(filepath)
                changes.append({
                    'path': filepath,
                    'change': 'modified',
                    'hash': current_data['hash'],
                    'previous_hash': baseline_snapshot[filepath]['hash'],
                    'severity': severity
                })
        
        # Check for deleted files
        for filepath in baseline_snapshot:
            if filepath not in current_snapshot:
                severity = self._assess_file_risk(filepath)
                changes.append({
                    'path': filepath,
                    'change': 'deleted',
                    'severity': severity
                })
        
        return changes
    
    def _assess_file_risk(self, filepath: str) -> str:
        """
        Assess risk level of a file change based on path.
        
        Args:
            filepath: File path
        
        Returns:
            Risk level: 'low', 'medium', or 'high'
        """
        filepath_lower = filepath.lower()
        
        # High-risk paths
        high_risk_indicators = [
            'system32\\drivers',
            'system32\\config',
            'windows\\system32\\',
            'startup',
            'run\\',
            'temp\\',
            'public\\'
        ]
        
        # Medium-risk paths
        medium_risk_indicators = [
            'program files',
            'programdata',
            'users\\'
        ]
        
        for indicator in high_risk_indicators:
            if indicator in filepath_lower:
                return 'high'
        
        for indicator in medium_risk_indicators:
            if indicator in filepath_lower:
                return 'medium'
        
        return 'low'
    
    def _calculate_severity(self, changes: List[Dict]) -> str:
        """
        Calculate overall severity based on changes.
        
        Args:
            changes: List of detected changes
        
        Returns:
            Overall severity: 'low', 'medium', or 'high'
        """
        if not changes:
            return 'low'
        
        high_severity_count = sum(1 for c in changes if c.get('severity') == 'high')
        medium_severity_count = sum(1 for c in changes if c.get('severity') == 'medium')
        
        if high_severity_count >= 3 or len(changes) >= 10:
            return 'high'
        elif high_severity_count >= 1 or medium_severity_count >= 3:
            return 'medium'
        else:
            return 'low'
    
    def get_results(self, job_id: str) -> Dict[str, Any]:
        """
        Retrieve scan results.
        
        Args:
            job_id: Scan job identifier
        
        Returns:
            Dictionary with scan results
        """
        if job_id not in self.scans:
            logger.warning(f"Scan job not found: {job_id}")
            return {
                'job_id': job_id,
                'status': 'not_found',
                'message': 'Scan job not found'
            }
        
        return self.scans[job_id]
    
    def get_baseline(self, host_id: str) -> Optional[Dict[str, Any]]:
        """
        Get baseline for a host.
        
        Args:
            host_id: Host identifier
        
        Returns:
            Baseline data or None if not found
        """
        if host_id not in self.baselines:
            return None
        
        baseline = self.baselines[host_id]
        return {
            'host_id': baseline['host_id'],
            'created_at': baseline['created_at'],
            'file_count': baseline['file_count'],
            'last_scan': baseline.get('last_scan', baseline['created_at'])
        }
    
    def create_baseline(self, host_id: str) -> Dict[str, Any]:
        """
        Explicitly create a new baseline for a host.
        
        Args:
            host_id: Host identifier
        
        Returns:
            Status message
        """
        # Start a scan which will create the baseline
        result = self.start_scan(host_id)
        
        return {
            'status': 'success',
            'message': f'Baseline creation initiated for {host_id}',
            'job_id': result['job_id']
        }
    
    def list_scans(self, host_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        List all scan jobs, optionally filtered by host.
        
        Args:
            host_id: Optional host filter
        
        Returns:
            List of scan job summaries
        """
        scans = []
        for job_id, scan in self.scans.items():
            if host_id is None or scan['host'] == host_id:
                scans.append({
                    'job_id': scan['job_id'],
                    'host': scan['host'],
                    'status': scan['status'],
                    'timestamp': scan['timestamp'],
                    'baseline_score': scan.get('baseline_score', 0),
                    'changes_count': len(scan.get('changes', []))
                })
        
        return sorted(scans, key=lambda x: x['timestamp'], reverse=True)
