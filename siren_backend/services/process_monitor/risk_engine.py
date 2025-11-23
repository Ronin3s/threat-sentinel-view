"""
RiskEngine - Process risk assessment and scoring

Calculates risk scores for processes based on multiple factors:
- High CPU usage (>50%)
- High memory usage (>500MB)
- Suspicious file paths (temp, downloads, etc.)
- Suspicious process names (powershell, cmd, rundll32, etc.)
- Running under different user context
"""

import os
import getpass
from typing import Dict, Optional


class RiskEngine:
    """
    Engine for calculating process risk scores.
    
    Assigns risk scores (0-100) based on multiple behavioral and
    contextual factors, categorizing processes as Low, Medium, or High risk.
    """
    
    # Suspicious process names commonly used in attacks
    SUSPICIOUS_NAMES = {
        'powershell.exe', 'powershell', 'pwsh.exe', 'pwsh',
        'cmd.exe', 'cmd',
        'rundll32.exe', 'rundll32',
        'regsvr32.exe', 'regsvr32',
        'wscript.exe', 'wscript',
        'cscript.exe', 'cscript',
        'mshta.exe', 'mshta',
        'certutil.exe', 'certutil',
        'bitsadmin.exe', 'bitsadmin',
        'psexec.exe', 'psexec',
    }
    
    # Suspicious path patterns
    SUSPICIOUS_PATHS = {
        '/tmp/', '/var/tmp/', '/dev/shm/',  # Linux temp dirs
        'C:\\Temp\\', 'C:\\Windows\\Temp\\',  # Windows temp
        'Downloads/', '\\Downloads\\',  # Downloads folders
        'AppData\\Local\\Temp\\',  # Windows user temp
        '/home/.hidden/',  # Hidden directories
    }
    
    def __init__(self):
        """Initialize the risk engine."""
        self.current_user = getpass.getuser()
    
    def calculate_risk_score(self, process_info: Dict) -> Dict[str, any]:
        """
        Calculate comprehensive risk score for a process.
        
        Args:
            process_info: Dictionary containing process details:
                - name: Process name
                - cpu_usage: CPU percentage
                - memory_usage: Memory in MB
                - path: Executable path
                - username: Process owner
        
        Returns:
            Dictionary with:
                - risk_score: Integer 0-100
                - risk_level: 'Low', 'Medium', or 'High'
                - risk_factors: List of identified risk factors
        """
        score = 0
        risk_factors = []
        
        # Factor 1: High CPU usage
        cpu_usage = process_info.get('cpu_usage', 0)
        if cpu_usage > 50:
            score += 30
            risk_factors.append(f'High CPU usage ({cpu_usage:.1f}%)')
        elif cpu_usage > 25:
            score += 15
            risk_factors.append(f'Elevated CPU usage ({cpu_usage:.1f}%)')
        
        # Factor 2: High memory usage
        memory_mb = process_info.get('memory_usage', 0)
        if memory_mb > 500:
            score += 20
            risk_factors.append(f'High memory usage ({memory_mb:.1f} MB)')
        elif memory_mb > 250:
            score += 10
            risk_factors.append(f'Elevated memory usage ({memory_mb:.1f} MB)')
        
        # Factor 3: Suspicious path
        path = process_info.get('path', '')
        if self._check_suspicious_path(path):
            score += 40
            risk_factors.append(f'Suspicious path detected')
        
        # Factor 4: Suspicious process name
        name = process_info.get('name', '').lower()
        if self._check_suspicious_name(name):
            score += 30
            risk_factors.append(f'Suspicious process name ({name})')
        
        # Factor 5: Running as different user (potential privilege escalation)
        username = process_info.get('username', '')
        if username and username != self.current_user and username != 'root':
            score += 20
            risk_factors.append(f'Running as different user ({username})')
        
        # Cap score at 100
        score = min(score, 100)
        
        # Determine risk level
        if score >= 61:
            risk_level = 'High'
        elif score >= 31:
            risk_level = 'Medium'
        else:
            risk_level = 'Low'
        
        return {
            'risk_score': score,
            'risk_level': risk_level,
            'risk_factors': risk_factors
        }
    
    def _check_suspicious_path(self, path: str) -> bool:
        """
        Check if process path matches suspicious patterns.
        
        Args:
            path: Full path to process executable
        
        Returns:
            True if path is suspicious, False otherwise
        """
        if not path:
            return False
        
        path_lower = path.lower()
        return any(pattern.lower() in path_lower for pattern in self.SUSPICIOUS_PATHS)
    
    def _check_suspicious_name(self, name: str) -> bool:
        """
        Check if process name is in the suspicious list.
        
        Args:
            name: Process name (case-insensitive)
        
        Returns:
            True if name is suspicious, False otherwise
        """
        return name.lower() in self.SUSPICIOUS_NAMES
