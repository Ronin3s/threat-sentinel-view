"""
Containment Routes - Flask Blueprint
Endpoints:
    POST /api/contain/isolate/<host>   - Isolate a host
    POST /api/contain/block/<ip>       - Block an IP address
"""

from flask import Blueprint, jsonify
import logging
from .actions import ContainmentActions

logger = logging.getLogger(__name__)

containment_bp = Blueprint('containment', __name__)
actions = ContainmentActions()


@containment_bp.route('/isolate/<host>', methods=['POST'])
def isolate_host(host):
    """POST /api/contain/isolate/<host> - Isolate a host"""
    try:
        result = actions.isolate_host(host)
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error isolating host: {e}")
        return jsonify({'error': str(e)}), 500


@containment_bp.route('/block/<ip>', methods=['POST'])
def block_ip(ip):
    """POST /api/contain/block/<ip> - Block an IP"""
    try:
        result = actions.block_ip(ip)
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error blocking IP: {e}")
        return jsonify({'error': str(e)}), 500
