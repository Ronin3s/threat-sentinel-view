"""
Behavior Monitor Routes - Flask Blueprint

Provides REST API endpoints for runtime behavioral monitoring.

Endpoints:
    GET  /api/behavior/events                - Get recent events
    GET  /api/behavior/stream                - Event stream (WebSocket placeholder)
    POST /api/behavior/analyze               - Analyze process behavior
    GET  /api/behavior/statistics            - Get monitoring statistics
    POST /api/behavior/simulate              - Generate test events
    GET  /api/behavior/rules                 - Get detection rules
    POST /api/behavior/event                 - Add custom event
    DELETE /api/behavior/events              - Clear all events
"""

from flask import Blueprint, jsonify, request
import logging
from .watcher import BehaviorWatcher

logger = logging.getLogger(__name__)

behavior_bp = Blueprint('behavior', __name__)
watcher = BehaviorWatcher()


@behavior_bp.route('/events', methods=['GET'])
def get_events():
    """
    GET /api/behavior/events?limit=50&severity=high
    
    Get recent behavioral events.
    
    Query Parameters:
        limit: Max events to return (default: 50)
        severity: Filter by severity (low, medium, high)
    
    Returns:
        JSON array of behavioral events
    """
    try:
        limit = int(request.args.get('limit', 50))
        severity = request.args.get('severity', None)
        
        events = watcher.get_events(limit, severity)
        
        return jsonify({
            'events': events,
            'count': len(events)
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching events: {e}")
        return jsonify({'error': str(e)}), 500


@behavior_bp.route('/stream', methods=['GET'])
def stream_events():
    """
    GET /api/behavior/stream
    
    Stream events (WebSocket placeholder).
    
    Note: Full WebSocket implementation requires Flask-SocketIO.
    For now, this returns a message about polling /events instead.
    
    Returns:
        Instructions for event streaming
    """
    return jsonify({
        'status': 'websocket_not_implemented',
        'message': 'WebSocket streaming not yet implemented',
        'alternative': 'Poll GET /api/behavior/events for updates',
        'recommended_interval': '5 seconds'
    }), 200


@behavior_bp.route('/analyze', methods=['POST'])
def analyze_behavior():
    """
    POST /api/behavior/analyze
    
    Analyze behavior for a specific process.
    
    Request Body:
        {
            "host": "hostname",
            "pid": 1234
        }
    
    Returns:
        Analysis results with matched rules and recommendations
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body required'}), 400
        
        host = data.get('host')
        pid = data.get('pid')
        
        if not host or not pid:
            return jsonify({'error': 'host and pid are required'}), 400
        
        result = watcher.analyze_behavior(host, pid)
        
        if result.get('status') == 'not_found':
            return jsonify(result), 404
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error analyzing behavior: {e}")
        return jsonify({'error': str(e)}), 500


@behavior_bp.route('/statistics', methods=['GET'])
def get_statistics():
    """
    GET /api/behavior/statistics
    
    Get monitoring statistics.
    
    Returns:
        Statistics including event counts, severity distribution, etc.
    """
    try:
        stats = watcher.get_statistics()
        return jsonify(stats), 200
        
    except Exception as e:
        logger.error(f"Error fetching statistics: {e}")
        return jsonify({'error': str(e)}), 500


@behavior_bp.route('/simulate', methods=['POST'])
def simulate_events():
    """
    POST /api/behavior/simulate
    
    Generate mock behavioral events for testing.
    
    Request Body (optional):
        {
            "event_count": 10
        }
    
    Returns:
        Summary of generated events
    """
    try:
        data = request.get_json() if request.is_json else {}
        event_count = data.get('event_count', 10)
        
        # Validate event count
        if not isinstance(event_count, int) or event_count < 1 or event_count > 100:
            return jsonify({'error': 'event_count must be between 1 and 100'}), 400
        
        result = watcher.start_monitoring_simulation(event_count)
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error simulating events: {e}")
        return jsonify({'error': str(e)}), 500


@behavior_bp.route('/rules', methods=['GET'])
def get_rules():
    """
    GET /api/behavior/rules
    
    Get all behavioral detection rules.
    
    Returns:
        JSON array of detection rules
    """
    try:
        rules = watcher.get_rules()
        return jsonify({
            'rules': rules,
            'count': len(rules)
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching rules: {e}")
        return jsonify({'error': str(e)}), 500


@behavior_bp.route('/event', methods=['POST'])
def add_event():
    """
    POST /api/behavior/event
    
    Add a custom behavioral event.
    
    Request Body:
        {
            "host": "hostname",
            "process": "process.exe",
            "pid": 1234,
            "behavior": ["behavior1", "behavior2"],
            "severity": "high",
            "confidence": "high"
        }
    
    Returns:
        Confirmation with event_id
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body required'}), 400
        
        # Validate required fields
        required = ['host', 'process', 'pid', 'behavior', 'severity']
        if not all(field in data for field in required):
            return jsonify({'error': f'Required fields: {", ".join(required)}'}), 400
        
        result = watcher.add_event(data)
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error adding event: {e}")
        return jsonify({'error': str(e)}), 500


@behavior_bp.route('/events', methods=['DELETE'])
def clear_events():
    """
    DELETE /api/behavior/events
    
    Clear all behavioral events (for testing).
    
    Returns:
        Confirmation with count of cleared events
    """
    try:
        result = watcher.clear_events()
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error clearing events: {e}")
        return jsonify({'error': str(e)}), 500


@behavior_bp.route('/health', methods=['GET'])
def health_check():
    """
    GET /api/behavior/health
    
    Health check for behavior monitor service.
    
    Returns:
        JSON with service status
    """
    stats = watcher.get_statistics()
    
    return jsonify({
        'status': 'healthy',
        'service': 'behavior_monitor',
        'total_events': stats['total_events'],
        'rules_loaded': stats['rules_loaded'],
        'unique_hosts': stats['unique_hosts']
    }), 200
