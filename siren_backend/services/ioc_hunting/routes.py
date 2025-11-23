"""
IOC Hunting Routes - Flask Blueprint

Provides REST API endpoints for hunting Indicators of Compromise.

Endpoints:
    POST /api/ioc/hunt          - Start IOC hunt
    GET  /api/ioc/results/<hunt_id>   - Get hunt results
"""

from flask import Blueprint, jsonify, request
import logging
from .hunter import IOCHunter

logger = logging.getLogger(__name__)

ioc_bp = Blueprint('ioc', __name__)
hunter = IOCHunter()


@ioc_bp.route('/hunt', methods=['POST'])
def start_hunt():
    """POST /api/ioc/hunt - Initiate IOC hunt"""
    try:
        data = request.get_json() or {}
        ioc_type = data.get('ioc_type', 'file_hash')
        ioc_value = data.get('ioc_value', '')
        
        result = hunter.start_hunt(ioc_type, ioc_value)
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error starting hunt: {e}")
        return jsonify({'error': str(e)}), 500


@ioc_bp.route('/results/<hunt_id>', methods=['GET'])
def get_hunt_results(hunt_id):
    """GET /api/ioc/results/<hunt_id> - Get hunt results"""
    try:
        result = hunter.get_results(hunt_id)
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error fetching hunt results: {e}")
        return jsonify({'error': str(e)}), 500
