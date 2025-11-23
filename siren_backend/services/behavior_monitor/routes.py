"""
Behavior Monitor Routes - Flask Blueprint
Endpoints:
    GET /api/behavior/events     - Get behavioral events
    GET /api/behavior/stream     - Stream real-time events (future WebSocket)
"""

from flask import Blueprint, jsonify
import logging
from .watcher import BehaviorWatcher

logger = logging.getLogger(__name__)

behavior_bp = Blueprint('behavior', __name__)
watcher = BehaviorWatcher()


@behavior_bp.route('/events', methods=['GET'])
def get_events():
    """GET /api/behavior/events - Get recent behavioral events"""
    try:
        events = watcher.get_recent_events()
        return jsonify(events), 200
    except Exception as e:
        logger.error(f"Error fetching events: {e}")
        return jsonify({'error': str(e)}), 500


@behavior_bp.route('/stream', methods=['GET'])
def stream_events():
    """GET /api/behavior/stream - Stream events (TODO: implement WebSocket)"""
    return jsonify({'message': 'WebSocket streaming not yet implemented', 'status': 'pending'}), 501
