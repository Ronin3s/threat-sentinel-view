"""
IOC Hunting Routes - Flask Blueprint

Provides REST API endpoints for hunting Indicators of Compromise.

Endpoints:
    POST /api/ioc/hunt                      - Start IOC hunt
    GET  /api/ioc/results/<hunt_id>         - Get hunt results
    GET  /api/ioc/hunts                     - List all hunts
    GET  /api/ioc/evidence/<host>           - Get evidence for host
    POST /api/ioc/evidence                  - Add evidence
    POST /api/ioc/analyze                   - Analyze IOC prevalence
"""

from flask import Blueprint, jsonify, request
import logging
from .hunter import IOCHunter

logger = logging.getLogger(__name__)

ioc_bp = Blueprint('ioc', __name__)
hunter = IOCHunter()


@ioc_bp.route('/hunt', methods=['POST'])
def start_hunt():
    """
    POST /api/ioc/hunt
    
    Initiate IOC hunt across monitored hosts.
    
    Request Body:
        {
            "ioc_type": "file_hash|ip_address|domain|url|email",
            "ioc_value": "value to search for"
        }
    
    Returns:
        JSON with hunt_id and status
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body required'}), 400
        
        ioc_type = data.get('ioc_type')
        ioc_value = data.get('ioc_value')
        
        if not ioc_type or not ioc_value:
            return jsonify({'error': 'ioc_type and ioc_value are required'}), 400
        
        result = hunter.start_hunt(ioc_type, ioc_value)
        
        if result.get('status') == 'error':
            return jsonify(result), 400
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error starting hunt: {e}")
        return jsonify({'error': str(e)}), 500


@ioc_bp.route('/results/<hunt_id>', methods=['GET'])
def get_hunt_results(hunt_id):
    """
    GET /api/ioc/results/<hunt_id>
    
    Get hunt results.
    
    Returns:
        JSON with hunt results and matches
    """
    try:
        result = hunter.get_results(hunt_id)
        
        if result.get('status') == 'not_found':
            return jsonify(result), 404
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error fetching hunt results: {e}")
        return jsonify({'error': str(e)}), 500


@ioc_bp.route('/hunts', methods=['GET'])
def list_hunts():
    """
    GET /api/ioc/hunts?status=<status>
    
    List all hunt jobs, optionally filtered by status.
    
    Query Parameters:
        status: Optional filter (running, completed, failed)
    
    Returns:
        JSON array of hunt summaries
    """
    try:
        status = request.args.get('status', None)
        hunts = hunter.list_hunts(status)
        
        return jsonify({
            'hunts': hunts,
            'count': len(hunts)
        }), 200
        
    except Exception as e:
        logger.error(f"Error listing hunts: {e}")
        return jsonify({'error': str(e)}), 500


@ioc_bp.route('/evidence/<host>', methods=['GET'])
def get_host_evidence(host):
    """
    GET /api/ioc/evidence/<host>
    
    Get all evidence for a specific host.
    
    Returns:
        JSON with evidence list
    """
    try:
        result = hunter.get_host_evidence(host)
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error fetching evidence: {e}")
        return jsonify({'error': str(e)}), 500


@ioc_bp.route('/evidence', methods=['POST'])
def add_evidence():
    """
    POST /api/ioc/evidence
    
    Add evidence to the database.
    
    Request Body:
        {
            "host": "hostname",
            "evidence_type": "file_hash|ip_address|domain|url|email",
            "evidence_value": "value",
            "location": "where found"
        }
    
    Returns:
        Confirmation message
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body required'}), 400
        
        host = data.get('host')
        evidence_type = data.get('evidence_type')
        evidence_value = data.get('evidence_value')
        location = data.get('location', 'Unknown')
        
        if not all([host, evidence_type, evidence_value]):
            return jsonify({'error': 'host, evidence_type, and evidence_value are required'}), 400
        
        result = hunter.add_evidence(host, evidence_type, evidence_value, location)
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error adding evidence: {e}")
        return jsonify({'error': str(e)}), 500


@ioc_bp.route('/analyze', methods=['POST'])
def analyze_prevalence():
    """
    POST /api/ioc/analyze
    
    Analyze IOC prevalence across infrastructure.
    
    Request Body:
        {
            "ioc_type": "file_hash|ip_address|domain|url|email",
            "ioc_value": "value to analyze"
        }
    
    Returns:
        JSON with prevalence statistics
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body required'}), 400
        
        ioc_type = data.get('ioc_type')
        ioc_value = data.get('ioc_value')
        
        if not ioc_type or not ioc_value:
            return jsonify({'error': 'ioc_type and ioc_value are required'}), 400
        
        result = hunter.analyze_ioc_prevalence(ioc_type, ioc_value)
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error analyzing prevalence: {e}")
        return jsonify({'error': str(e)}), 500


@ioc_bp.route('/health', methods=['GET'])
def health_check():
    """
    GET /api/ioc/health
    
    Health check for IOC hunting service.
    
    Returns:
        JSON with service status
    """
    return jsonify({
        'status': 'healthy',
        'service': 'ioc_hunting',
        'active_hunts': sum(1 for h in hunter.hunts.values() if h['status'] == 'running'),
        'total_hunts': len(hunter.hunts),
        'hosts_monitored': len(hunter.host_evidence)
    }), 200
