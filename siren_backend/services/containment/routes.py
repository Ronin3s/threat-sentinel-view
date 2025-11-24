"""
Containment Routes - Flask Blueprint

Provides REST API endpoints for automated containment actions.

Endpoints:
    POST /api/contain/isolate/<host>          - Isolate host
    POST /api/contain/restore/<host>          - Restore host
    POST /api/contain/block/<ip>              - Block IP address
    DELETE /api/contain/block/<ip>            - Unblock IP
    POST /api/contain/quarantine              - Quarantine file
    GET  /api/contain/status/<host>           - Get containment status
    GET  /api/contain/blocked-ips             - List blocked IPs
    GET  /api/contain/isolated-hosts          - List isolated hosts
    POST /api/contain/rollback/<action_id>    - Rollback action
    GET  /api/contain/history                 - Get action history
    GET  /api/contain/statistics              - Get statistics
"""

from flask import Blueprint, jsonify, request
import logging
from .actions import ContainmentActions

logger = logging.getLogger(__name__)

containment_bp = Blueprint('contain', __name__)
actions = ContainmentActions()


@containment_bp.route('/isolate/<host>', methods=['POST'])
def isolate_host(host):
    """
    POST /api/contain/isolate/<host>
    
    Isolate a host from the network.
    
    Request Body (optional):
        {
            "reason": "Security incident description"
        }
    
    Returns:
        Action result with action_id
    """
    try:
        data = request.get_json() if request.is_json else {}
        reason = data.get('reason', 'Security incident')
        
        result = actions.isolate_host(host, reason)
        
        status_code = 200 if result['status'] == 'success' else 400
        return jsonify(result), status_code
        
    except Exception as e:
        logger.error(f"Error isolating host: {e}")
        return jsonify({'error': str(e)}), 500


@containment_bp.route('/restore/<host>', methods=['POST'])
def restore_host(host):
    """
    POST /api/contain/restore/<host>
    
    Restore host from isolation.
    
    Returns:
        Restoration result
    """
    try:
        result = actions.restore_host(host)
        status_code = 200 if result['status'] == 'success' else 400
        return jsonify(result), status_code
        
    except Exception as e:
        logger.error(f"Error restoring host: {e}")
        return jsonify({'error': str(e)}), 500


@containment_bp.route('/block/<ip>', methods=['POST'])
def block_ip(ip):
    """
    POST /api/contain/block/<ip>
    
    Block an IP address at the firewall.
    
    Request Body (optional):
        {
            "reason": "Malicious activity description"
        }
    
    Returns:
        Action result with action_id
    """
    try:
        data = request.get_json() if request.is_json else {}
        reason = data.get('reason', 'Malicious activity')
        
        result = actions.block_ip(ip, reason)
        status_code = 200 if result['status'] == 'success' else 400
        return jsonify(result), status_code
        
    except Exception as e:
        logger.error(f"Error blocking IP: {e}")
        return jsonify({'error': str(e)}), 500


@containment_bp.route('/block/<ip>', methods=['DELETE'])
def unblock_ip(ip):
    """
    DELETE /api/contain/block/<ip>
    
    Unblock an IP address.
    
    Returns:
        Unblock result
    """
    try:
        result = actions.unblock_ip(ip)
        status_code = 200 if result['status'] == 'success' else 400
        return jsonify(result), status_code
        
    except Exception as e:
        logger.error(f"Error unblocking IP: {e}")
        return jsonify({'error': str(e)}), 500


@containment_bp.route('/quarantine', methods=['POST'])
def quarantine_file():
    """
    POST /api/contain/quarantine
    
    Quarantine a suspicious file.
    
    Request Body:
        {
            "file_path": "C:\\\\path\\\\to\\\\file.exe",
            "host": "hostname"
        }
    
    Returns:
        Quarantine result with action_id
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body required'}), 400
        
        file_path = data.get('file_path')
        host = data.get('host')
        
        if not file_path or not host:
            return jsonify({'error': 'file_path and host are required'}), 400
        
        result = actions.quarantine_file(file_path, host)
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error quarantining file: {e}")
        return jsonify({'error': str(e)}), 500


@containment_bp.route('/status/<host>', methods=['GET'])
def get_status(host):
    """
    GET /api/contain/status/<host>
    
    Get containment status for a host.
    
    Returns:
        Status information
    """
    try:
        result = actions.get_containment_status(host)
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error fetching status: {e}")
        return jsonify({'error': str(e)}), 500


@containment_bp.route('/blocked-ips', methods=['GET'])
def list_blocked_ips():
    """
    GET /api/contain/blocked-ips
    
    List all blocked IP addresses.
    
    Returns:
        Array of blocked IPs
    """
    try:
        result = actions.list_blocked_ips()
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error listing blocked IPs: {e}")
        return jsonify({'error': str(e)}), 500


@containment_bp.route('/isolated-hosts', methods=['GET'])
def list_isolated_hosts():
    """
    GET /api/contain/isolated-hosts
    
    List all isolated hosts.
    
    Returns:
        Array of isolated hosts
    """
    try:
        result = actions.list_isolated_hosts()
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error listing isolated hosts: {e}")
        return jsonify({'error': str(e)}), 500


@containment_bp.route('/rollback/<action_id>', methods=['POST'])
def rollback_action(action_id):
    """
    POST /api/contain/rollback/<action_id>
    
    Rollback a containment action.
    
    Returns:
        Rollback result
    """
    try:
        result = actions.rollback_action(action_id)
        status_code = 200 if result['status'] == 'success' else 404
        return jsonify(result), status_code
        
    except Exception as e:
        logger.error(f"Error rolling back action: {e}")
        return jsonify({'error': str(e)}), 500


@containment_bp.route('/history', methods=['GET'])
def get_history():
    """
    GET /api/contain/history?limit=50
    
    Get action history.
    
    Query Parameters:
        limit: Maximum actions to return (default: 50)
    
    Returns:
        Array of actions
    """
    try:
        limit = int(request.args.get('limit', 50))
        history = actions.get_action_history(limit)
        
        return jsonify({
            'actions': history,
            'count': len(history)
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching history: {e}")
        return jsonify({'error': str(e)}), 500


@containment_bp.route('/statistics', methods=['GET'])
def get_statistics():
    """
    GET /api/contain/statistics
    
    Get containment statistics.
    
    Returns:
        Statistics dictionary
    """
    try:
        stats = actions.get_statistics()
        return jsonify(stats), 200
        
    except Exception as e:
        logger.error(f"Error fetching statistics: {e}")
        return jsonify({'error': str(e)}), 500


@containment_bp.route('/health', methods=['GET'])
def health_check():
    """
    GET /api/contain/health
    
    Health check for containment service.
    
    Returns:
        JSON with service status
    """
    stats = actions.get_statistics()
    
    return jsonify({
        'status': 'healthy',
        'service': 'containment',
        'total_actions': stats['total_actions'],
        'isolated_hosts': stats['isolated_hosts'],
        'blocked_ips': stats['blocked_ips']
    }), 200
