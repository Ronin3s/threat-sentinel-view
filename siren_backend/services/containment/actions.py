"""
Containment Actions - Automated Response & Host Isolation

Provides containment capabilities including host isolation,
IP blocking, process termination, and quarantine management.
"""

import logging
import uuid
import os
import subprocess
from typing import Dict, List, Any, Optional
from utils.common import get_timestamp

logger = logging.getLogger(__name__)


class ContainmentActions:
    """
    Automated containment and response actions.
    
    Capabilities:
    - Host network isolation
    - IP address blocking
    - Process termination across hosts
    - File quarantine
    - Action tracking and rollback
    """
    
    def __init__(self):
        """Initialize containment actions manager."""
        self.actions = {}  # Action history: {action_id: action_data}
        self.isolated_hosts = set()
        self.blocked_ips = set()
        self.quarantined_files = {}
        logger.info("ContainmentActions initialized")
    
    def isolate_host(self, host: str, reason: str = "Security incident") -> Dict[str, Any]:
        """
        Isolate a host from the network.
        
        In production, this would use:
        - Windows Firewall rules to block all traffic
        - netsh commands to disable network adapters
        - Group Policy to enforce quarantine
        
        Args:
            host: Host identifier
            reason: Reason for isolation
        
        Returns:
            Action result
        """
        action_id = f"iso-{uuid.uuid4().hex[:8]}"
        
        if host in self.isolated_hosts:
            logger.warning(f"Host {host} already isolated")
            return {
                'status': 'already_isolated',
                'host': host,
                'message': 'Host is already in isolated state'
            }
        
        # In production, execute actual isolation:
        # - Block all inbound/outbound traffic except admin access
        # - Disable network adapters
        # - Create firewall rules
        
        success = self._simulate_network_isolation(host)
        
        if success:
            self.isolated_hosts.add(host)
            
            # Record action
            self.actions[action_id] = {
                'action_id': action_id,
                'action_type': 'host_isolation',
                'host': host,
                'reason': reason,
                'timestamp': get_timestamp(),
                'status': 'completed',
                'reversible': True
            }
            
            logger.info(f"Host {host} isolated - Action ID: {action_id}")
            
            return {
                'status': 'success',
                'action_id': action_id,
                'host': host,
                'message': f'Host {host} successfully isolated',
                'timestamp': get_timestamp()
            }
        else:
            return {
                'status': 'failed',
                'host': host,
                'message': 'Failed to isolate host'
            }
    
    def _simulate_network_isolation(self, host: str) -> bool:
        """
        Simulate network isolation.
        In production, this would execute actual firewall commands.
        
        Args:
            host: Host to isolate
        
        Returns:
            Success status
        """
        # Mock implementation - always succeeds
        # In production, would execute:
        # netsh advfirewall set allprofiles state on
        # netsh advfirewall set allprofiles firewallpolicy blockinbound,blockoutbound
        logger.debug(f"Simulated network isolation for {host}")
        return True
    
    def restore_host(self, host: str) -> Dict[str, Any]:
        """
        Restore host network access (remove isolation).
        
        Args:
            host: Host identifier
        
        Returns:
            restoration result
        """
        if host not in self.isolated_hosts:
            return {
                'status': 'not_isolated',
                'host': host,
                'message': 'Host is not currently isolated'
            }
        
        # Remove from isolated set
        self.isolated_hosts.remove(host)
        
        # In production: restore firewall rules, enable network adapters
        logger.info(f"Host {host} restored from isolation")
        
        return {
            'status': 'success',
            'host': host,
            'message': f'Host {host} restored to normal state',
            'timestamp': get_timestamp()
        }
    
    def block_ip(self, ip_address: str, reason: str = "Malicious activity") -> Dict[str, Any]:
        """
        Block an IP address at the firewall level.
        
        In production, this would create firewall rules to block traffic.
        
        Args:
            ip_address: IP to block
            reason: Reason for blocking
        
        Returns:
            Action result
        """
        action_id = f"blk-{uuid.uuid4().hex[:8]}"
        
        if ip_address in self.blocked_ips:
            return {
                'status': 'already_blocked',
                'ip_address': ip_address,
                'message': 'IP address is already blocked'
            }
        
        # Validate IP format (basic)
        if not self._is_valid_ip(ip_address):
            return {
                'status': 'error',
                'message': 'Invalid IP address format'
            }
        
        # In production: Create firewall rule
        # netsh advfirewall firewall add rule name="Block {ip}" dir=in action=block remoteip={ip}
        # netsh advfirewall firewall add rule name="Block {ip}" dir=out action=block remoteip={ip}
        
        success = self._simulate_ip_block(ip_address)
        
        if success:
            self.blocked_ips.add(ip_address)
            
            # Record action
            self.actions[action_id] = {
                'action_id': action_id,
                'action_type': 'ip_block',
                'ip_address': ip_address,
                'reason': reason,
                'timestamp': get_timestamp(),
                'status': 'completed',
                'reversible': True
            }
            
            logger.info(f"IP {ip_address} blocked - Action ID: {action_id}")
            
            return {
                'status': 'success',
                'action_id': action_id,
                'ip_address': ip_address,
                'message': f'IP {ip_address} blocked successfully',
                'timestamp': get_timestamp()
            }
        else:
            return {
                'status': 'failed',
                'ip_address': ip_address,
                'message': 'Failed to block IP'
            }
    
    def _simulate_ip_block(self, ip_address: str) -> bool:
        """Simulate IP blocking (mock)."""
        logger.debug(f"Simulated IP block for {ip_address}")
        return True
    
    def _is_valid_ip(self, ip: str) -> bool:
        """Basic IP validation."""
        parts = ip.split('.')
        if len(parts) != 4:
            return False
        try:
            return all(0 <= int(part) <= 255 for part in parts)
        except ValueError:
            return False
    
    def unblock_ip(self, ip_address: str) -> Dict[str, Any]:
        """
        Unblock an IP address.
        
        Args:
            ip_address: IP to unblock
        
        Returns:
            Unblock result
        """
        if ip_address not in self.blocked_ips:
            return {
                'status': 'not_blocked',
                'ip_address': ip_address,
                'message': 'IP address is not currently blocked'
            }
        
        self.blocked_ips.remove(ip_address)
        
        # In production: Remove firewall rule
        logger.info(f"IP {ip_address} unblocked")
        
        return {
            'status': 'success',
            'ip_address': ip_address,
            'message': f'IP {ip_address} unblocked successfully',
            'timestamp': get_timestamp()
        }
    
    def quarantine_file(self, file_path: str, host: str) -> Dict[str, Any]:
        """
        Quarantine a suspicious file.
        
        Moves file to quarantine directory and prevents execution.
        
        Args:
            file_path: Path to file
            host: Host where file is located
        
        Returns:
            Action result
        """
        action_id = f"quar-{uuid.uuid4().hex[:8]}"
        
        # In production:
        # 1. Copy file to quarantine folder (with timestamp/hash in name)
        # 2. Delete original
        # 3. Set quarantine folder permissions (read-only, no execute)
        # 4. Record file metadata (hash, size, timestamps)
        
        quarantine_path = f"C:\\Quarantine\\{action_id}_{os.path.basename(file_path)}"
        
        self.quarantined_files[action_id] = {
            'action_id': action_id,
            'original_path': file_path,
            'quarantine_path': quarantine_path,
            'host': host,
            'timestamp': get_timestamp(),
            'status': 'quarantined'
        }
        
        # Record action
        self.actions[action_id] = {
            'action_id': action_id,
            'action_type': 'file_quarantine',
            'file_path': file_path,
            'host': host,
            'timestamp': get_timestamp(),
            'status': 'completed',
            'reversible': True
        }
        
        logger.info(f"File quarantined: {file_path} on {host} - Action ID: {action_id}")
        
        return {
            'status': 'success',
            'action_id': action_id,
            'file_path': file_path,
            'quarantine_path': quarantine_path,
            'host': host,
            'message': 'File successfully quarantined',
            'timestamp': get_timestamp()
        }
    
    def get_containment_status(self, host: str) -> Dict[str, Any]:
        """
        Get containment status for a host.
        
        Args:
            host: Host identifier
        
        Returns:
            Status information
        """
        is_isolated = host in self.isolated_hosts
        
        # Find all actions for this host
        host_actions = [
            action for action in self.actions.values()
            if action.get('host') == host
        ]
        
        return {
            'host': host,
            'isolated': is_isolated,
            'action_count': len(host_actions),
            'recent_actions': sorted(host_actions, key=lambda x: x['timestamp'], reverse=True)[:5]
        }
    
    def list_blocked_ips(self) -> Dict[str, Any]:
        """
        List all blocked IP addresses.
        
        Returns:
            List of blocked IPs
        """
        return {
            'blocked_ips': list(self.blocked_ips),
            'count': len(self.blocked_ips)
        }
    
    def list_isolated_hosts(self) -> Dict[str, Any]:
        """
        List all isolated hosts.
        
        Returns:
            List of isolated hosts
        """
        return {
            'isolated_hosts': list(self.isolated_hosts),
            'count': len(self.isolated_hosts)
        }
    
    def rollback_action(self, action_id: str) -> Dict[str, Any]:
        """
        Rollback a containment action.
        
        Args:
            action_id: Action to rollback
        
        Returns:
            Rollback result
        """
        if action_id not in self.actions:
            return {
                'status': 'not_found',
                'message': f'Action {action_id} not found'
            }
        
        action = self.actions[action_id]
        
        if not action.get('reversible', False):
            return {
                'status': 'error',
                'message': 'Action is not reversible'
            }
        
        action_type = action['action_type']
        
        # Perform rollback based on type
        if action_type == 'host_isolation':
            host = action['host']
            if host in self.isolated_hosts:
                self.isolated_hosts.remove(host)
            message = f"Host {host} restored"
            
        elif action_type == 'ip_block':
            ip = action['ip_address']
            if ip in self.blocked_ips:
                self.blocked_ips.remove(ip)
            message = f"IP {ip} unblocked"
            
        elif action_type == 'file_quarantine':
            # Restore file from quarantine
            message = f"File restored from quarantine"
        
        else:
            message = "Action rolled back"
        
        # Update action status
        action['status'] = 'rolled_back'
        action['rollback_timestamp'] = get_timestamp()
        
        logger.info(f"Action {action_id} rolled back")
        
        return {
            'status': 'success',
            'action_id': action_id,
            'message': message,
            'timestamp': get_timestamp()
        }
    
    def get_action_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get action history.
        
        Args:
            limit: Maximum number of actions to return
        
        Returns:
            List of actions
        """
        actions = sorted(
            self.actions.values(),
            key=lambda x: x['timestamp'],
            reverse=True
        )
        
        return actions[:limit]
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        Get containment statistics.
        
        Returns:
            Statistics dictionary
        """
        return {
            'total_actions': len(self.actions),
            'isolated_hosts': len(self.isolated_hosts),
            'blocked_ips': len(self.blocked_ips),
            'quarantined_files': len(self.quarantined_files),
            'actions_by_type': {
                'host_isolation': sum(1 for a in self.actions.values() if a['action_type'] == 'host_isolation'),
                'ip_block': sum(1 for a in self.actions.values() if a['action_type'] == 'ip_block'),
                'file_quarantine': sum(1 for a in self.actions.values() if a['action_type'] == 'file_quarantine')
            }
        }
