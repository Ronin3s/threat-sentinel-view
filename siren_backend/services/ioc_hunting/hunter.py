"""
IOC Hunter - Cross-Host Indicator of Compromise Search

Provides capability to search for malicious indicators across
monitored hosts including file hashes, IP addresses, domains, and URLs.
"""

import logging
import uuid
import re
import hashlib
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from utils.common import get_timestamp

logger = logging.getLogger(__name__)


class IOCHunter:
    """
    Hunt for Indicators of Compromise across infrastructure.
    
    Supports searching for:
    - File hashes (MD5, SHA256)
    - IP addresses
    - Domain names
    - URLs
    - Email addresses
    """
    
    def __init__(self):
        """Initialize the IOC hunter with mock data store."""
        self.hunts = {}  # Hunt job storage
        self.host_evidence = self._generate_mock_evidence()  # Mock evidence database
        logger.info("IOCHunter initialized")
    
    def _generate_mock_evidence(self) -> Dict[str, List[Dict]]:
        """
        Generate mock evidence database for testing.
        In production, this would query actual host agents or SIEM.
        
        Returns:
            Dictionary mapping hosts to evidence items
        """
        # Simulated evidence from various hosts
        evidence_db = {
            'WIN-SRV-01': [
                {
                    'type': 'file_hash',
                    'value': 'b40f6b2c167239519fcfb2028ab2524a',
                    'location': 'C:\\Users\\Public\\temp.exe',
                    'timestamp': (datetime.now() - timedelta(hours=2)).isoformat()
                },
                {
                    'type': 'ip_address',
                    'value': '192.168.1.100',
                    'location': 'Network connection',
                    'timestamp': (datetime.now() - timedelta(hours=1)).isoformat()
                }
            ],
            'WIN-WKS-05': [
                {
                    'type': 'file_hash',
                    'value': 'a1b2c3d4e5f67890abcdef1234567890',
                    'location': 'C:\\Temp\\suspicious.dll',
                    'timestamp': (datetime.now() - timedelta(hours=3)).isoformat()
                },
                {
                    'type': 'domain',
                    'value': 'malicious-domain.com',
                    'location': 'DNS query log',
                    'timestamp': (datetime.now() - timedelta(minutes=30)).isoformat()
                }
            ],
            'WIN-WKS-12': [
                {
                    'type': 'ip_address',
                    'value': '192.168.1.100',
                    'location': 'Outbound connection',
                    'timestamp': (datetime.now() - timedelta(minutes=45)).isoformat()
                }
            ]
        }
        
        return evidence_db
    
    def start_hunt(self, ioc_type: str, ioc_value: str) -> Dict[str, Any]:
        """
        Start IOC hunt across all monitored hosts.
        
        Args:
            ioc_type: Type of IOC (file_hash, ip_address, domain, url, email)
            ioc_value: Value to search for
        
        Returns:
            Dictionary with hunt_id and status
        """
        hunt_id = f"hunt-{uuid.uuid4().hex[:8]}"
        
        # Validate IOC type
        valid_types = ['file_hash', 'ip_address', 'domain', 'url', 'email']
        if ioc_type not in valid_types:
            logger.warning(f"Invalid IOC type: {ioc_type}")
            return {
                'status': 'error',
                'message': f'Invalid IOC type. Must be one of: {", ".join(valid_types)}'
            }
        
        # Validate IOC value format
        if not self._validate_ioc_format(ioc_type, ioc_value):
            logger.warning(f"Invalid IOC value format: {ioc_value}")
            return {
                'status': 'error',
                'message': f'Invalid {ioc_type} format'
            }
        
        # Initialize hunt job
        self.hunts[hunt_id] = {
            'hunt_id': hunt_id,
            'ioc_type': ioc_type,
            'ioc_value': ioc_value,
            'status': 'running',
            'started_at': get_timestamp(),
            'matches': []
        }
        
        logger.info(f"Hunt started: {hunt_id} for {ioc_type}={ioc_value}")
        
        # Execute the hunt
        try:
            self._execute_hunt(hunt_id, ioc_type, ioc_value)
        except Exception as e:
            logger.error(f"Hunt {hunt_id} failed: {e}")
            self.hunts[hunt_id]['status'] = 'failed'
            self.hunts[hunt_id]['error'] = str(e)
        
        return {
            'hunt_id': hunt_id,
            'status': self.hunts[hunt_id]['status']
        }
    
    def _validate_ioc_format(self, ioc_type: str, ioc_value: str) -> bool:
        """
        Validate IOC value format.
        
        Args:
            ioc_type: Type of IOC
            ioc_value: Value to validate
        
        Returns:
            True if valid, False otherwise
        """
        if ioc_type == 'file_hash':
            # MD5 (32 chars) or SHA256 (64 chars) hex
            return bool(re.match(r'^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{64}$', ioc_value))
        
        elif ioc_type == 'ip_address':
            # Basic IPv4 validation
            parts = ioc_value.split('.')
            if len(parts) != 4:
                return False
            try:
                return all(0 <= int(part) <= 255 for part in parts)
            except ValueError:
                return False
        
        elif ioc_type == 'domain':
            # Basic domain validation
            return bool(re.match(r'^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$', ioc_value))
        
        elif ioc_type == 'url':
            # Basic URL validation
            return bool(re.match(r'^https?://', ioc_value))
        
        elif ioc_type == 'email':
            # Basic email validation
            return bool(re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', ioc_value))
        
        return True  # Default to valid for unknown types
    
    def _execute_hunt(self, hunt_id: str, ioc_type: str, ioc_value: str) -> None:
        """
        Execute the actual IOC hunt across hosts.
        
        Args:
            hunt_id: Hunt job identifier
            ioc_type: Type of IOC
            ioc_value: Value to search for
        """
        matches = []
        
        # Search through evidence database
        for host, evidence_list in self.host_evidence.items():
            for evidence in evidence_list:
                # Match on type and value
                if evidence['type'] == ioc_type:
                    if self._ioc_matches(evidence['value'], ioc_value, ioc_type):
                        matches.append({
                            'host': host,
                            'evidence': evidence['location'],
                            'first_seen': evidence['timestamp'],
                            'confidence': 'high',
                            'context': {
                                'ioc_type': ioc_type,
                                'ioc_value': evidence['value']
                            }
                        })
        
        # Update hunt with results
        self.hunts[hunt_id].update({
            'status': 'completed',
            'matches': matches,
            'completed_at': get_timestamp(),
            'hosts_scanned': len(self.host_evidence),
            'matches_found': len(matches)
        })
        
        logger.info(f"Hunt {hunt_id} completed: {len(matches)} matches found across {len(self.host_evidence)} hosts")
    
    def _ioc_matches(self, evidence_value: str, search_value: str, ioc_type: str) -> bool:
        """
        Check if evidence value matches search value.
        
        Args:
            evidence_value: Value from evidence
            search_value: Value being searched for
            ioc_type: Type of IOC
        
        Returns:
            True if match, False otherwise
        """
        # Case-insensitive comparison for most types
        if ioc_type in ['domain', 'email', 'url']:
            return evidence_value.lower() == search_value.lower()
        
        # Exact match for hashes and IPs
        return evidence_value == search_value
    
    def get_results(self, hunt_id: str) -> Dict[str, Any]:
        """
        Get hunt results.
        
        Args:
            hunt_id: Hunt job identifier
        
        Returns:
            Dictionary with hunt results
        """
        if hunt_id not in self.hunts:
            logger.warning(f"Hunt not found: {hunt_id}")
            return {
                'hunt_id': hunt_id,
                'status': 'not_found',
                'message': 'Hunt job not found'
            }
        
        return self.hunts[hunt_id]
    
    def list_hunts(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        List all hunt jobs, optionally filtered by status.
        
        Args:
            status: Optional status filter (running, completed, failed)
        
        Returns:
            List of hunt job summaries
        """
        hunts = []
        for hunt_id, hunt in self.hunts.items():
            if status is None or hunt['status'] == status:
                hunts.append({
                    'hunt_id': hunt['hunt_id'],
                    'ioc_type': hunt['ioc_type'],
                    'ioc_value': hunt['ioc_value'],
                    'status': hunt['status'],
                    'started_at': hunt['started_at'],
                    'matches_found': hunt.get('matches_found', 0)
                })
        
        return sorted(hunts, key=lambda x: x['started_at'], reverse=True)
    
    def add_evidence(self, host: str, evidence_type: str, evidence_value: str, location: str) -> Dict[str, Any]:
        """
        Add evidence to the database (for testing or integration).
        
        Args:
            host: Host identifier
            evidence_type: Type of evidence
            evidence_value: Evidence value
            location: Location/context where found
        
        Returns:
            Confirmation message
        """
        if host not in self.host_evidence:
            self.host_evidence[host] = []
        
        self.host_evidence[host].append({
            'type': evidence_type,
            'value': evidence_value,
            'location': location,
            'timestamp': get_timestamp()
        })
        
        logger.info(f"Evidence added for {host}: {evidence_type}={evidence_value}")
        
        return {
            'status': 'success',
            'message': f'Evidence added for {host}'
        }
    
    def get_host_evidence(self, host: str) -> Dict[str, Any]:
        """
        Get all evidence for a specific host.
        
        Args:
            host: Host identifier
        
        Returns:
            Dictionary with evidence list
        """
        if host not in self.host_evidence:
            return {
                'host': host,
                'evidence': [],
                'count': 0
            }
        
        return {
            'host': host,
            'evidence': self.host_evidence[host],
            'count': len(self.host_evidence[host])
        }
    
    def analyze_ioc_prevalence(self, ioc_type: str, ioc_value: str) -> Dict[str, Any]:
        """
        Analyze how prevalent an IOC is across the infrastructure.
        
        Args:
            ioc_type: Type of IOC
            ioc_value: Value to analyze
        
        Returns:
            Prevalence statistics
        """
        affected_hosts = []
        total_occurrences = 0
        
        for host, evidence_list in self.host_evidence.items():
            host_count = 0
            for evidence in evidence_list:
                if evidence['type'] == ioc_type and self._ioc_matches(evidence['value'], ioc_value, ioc_type):
                    host_count += 1
            
            if host_count > 0:
                affected_hosts.append({
                    'host': host,
                    'occurrences': host_count
                })
                total_occurrences += host_count
        
        return {
            'ioc_type': ioc_type,
            'ioc_value': ioc_value,
            'total_hosts': len(self.host_evidence),
            'affected_hosts': len(affected_hosts),
            'total_occurrences': total_occurrences,
            'prevalence_rate': len(affected_hosts) / len(self.host_evidence) if self.host_evidence else 0,
            'hosts': affected_hosts
        }
