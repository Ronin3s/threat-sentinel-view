"""
MetricsBuffer - Thread-safe circular buffer for system metrics

Stores the last 60 seconds of CPU and memory usage data for visualization.
Uses a deque with maxlen=60 to automatically discard old data.
"""

import threading
from collections import deque
from datetime import datetime
from typing import List, Dict


class MetricsBuffer:
    """
    Thread-safe circular buffer for storing system metrics.
    
    Maintains exactly 60 seconds of CPU and memory usage data,
    automatically discarding older entries.
    """
    
    def __init__(self, max_size: int = 60):
        """
        Initialize the metrics buffer.
        
        Args:
            max_size: Maximum number of entries to store (default: 60)
        """
        self._cpu_buffer = deque(maxlen=max_size)
        self._memory_buffer = deque(maxlen=max_size)
        self._lock = threading.Lock()
    
    def add_metric(self, cpu_percent: float, memory_percent: float) -> None:
        """
        Add a new metric entry with current timestamp.
        
        Thread-safe operation that adds CPU and memory usage to their
        respective buffers with an ISO 8601 timestamp.
        
        Args:
            cpu_percent: CPU usage percentage (0-100)
            memory_percent: Memory usage percentage (0-100)
        """
        timestamp = datetime.utcnow().isoformat() + 'Z'
        
        with self._lock:
            self._cpu_buffer.append({
                'time': timestamp,
                'usage': round(cpu_percent, 2)
            })
            self._memory_buffer.append({
                'time': timestamp,
                'usage': round(memory_percent, 2)
            })
    
    def get_all_metrics(self) -> Dict[str, List[Dict[str, any]]]:
        """
        Retrieve all stored metrics.
        
        Returns:
            Dictionary with 'cpu' and 'memory' keys, each containing
            a list of {time, usage} dictionaries.
        """
        with self._lock:
            return {
                'cpu': list(self._cpu_buffer),
                'memory': list(self._memory_buffer)
            }
    
    def clear(self) -> None:
        """Clear all stored metrics."""
        with self._lock:
            self._cpu_buffer.clear()
            self._memory_buffer.clear()
    
    def get_size(self) -> int:
        """Get the current number of stored metrics."""
        with self._lock:
            return len(self._cpu_buffer)
