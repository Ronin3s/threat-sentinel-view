"""
Integrity Scanner Routes - Flask Blueprint

Provides REST API endpoints for host integrity scanning and baseline monitoring.

Endpoints:
    POST /api/integrity/scan/<host_id>           - Start integrity scan
    GET  /api/integrity/results/<job_id>         - Get scan results
    GET  /api/integrity/baseline/<host_id>       - Get host baseline
    POST /api/integrity/baseline/<host_id>       - Create baseline
    GET  /api/integrity/scans                    - List all scans
    GET  /api/integrity/scans/<host_id>          - List scans for host
"""

from flask import Blueprint, jsonify, request
import logging
from .scanner import IntegrityScanner
from utils.common import format_response, format_error, get_timestamp

logger = logging.getLogger(__name__)

# Create Blueprint
integrity_bp = Blueprint('integrity', __name__)

# Initialize service
scanner = IntegrityScanner()


@integrity_bp.route('/scan/<host_id>', methods=['POST'])
def start_scan(host_id):
    """
    POST /api/integrity/scan/<host_id>
    
    Initiate integrity scan for a host.
    
    Request Body (optional):
        {
            "scan_paths": ["C:\\Windows\\System32", "C:\\Program Files"]
        }
    
    Returns:
        JSON with job_id and status
    """
    try:
        data = request.get_json() if request.is_json else {}
        scan_paths = data.get('scan_paths', None)
        
        logger.info(f"Starting integrity scan for host: {host_id}")
        result = scanner.start_scan(host_id, scan_paths)
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error starting scan: {e}")
        return jsonify(format_error(str(e))), 500


@integrity_bp.route('/results/<job_id>', methods=['GET'])
def get_results(job_id):
    """
    GET /api/integrity/results/<job_id>
    
    Retrieve scan results.
    
    Returns:
        JSON with complete scan results including changes
    """
    try:
        logger.debug(f"Fetching results for job: {job_id}")
        result = scanner.get_results(job_id)
        
        if result.get('status') == 'not_found':
            return jsonify(result), 404
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error fetching results: {e}")
        return jsonify(format_error(str(e))), 500


@integrity_bp.route('/baseline/<host_id>', methods=['GET'])
def get_baseline(host_id):
    """
    GET /api/integrity/baseline/<host_id>
    
    Get baseline information for a host.
    
    Returns:
        JSON with baseline data or 404 if not found
    """
    try:
        logger.debug(f"Fetching baseline for host: {host_id}")
        baseline = scanner.get_baseline(host_id)
        
        if baseline is None:
            return jsonify({
                'status': 'not_found',
                'message': f'No baseline found for {host_id}'
            }), 404
        
        return jsonify(baseline), 200
        
    except Exception as e:
        logger.error(f"Error fetching baseline: {e}")
        return jsonify(format_error(str(e))), 500


@integrity_bp.route('/baseline/<host_id>', methods=['POST'])
def create_baseline(host_id):
    """
    POST /api/integrity/baseline/<host_id>
    
    Create a new baseline for a host.
    
    Returns:
        JSON with job_id for baseline creation
    """
    try:
        logger.info(f"Creating baseline for host: {host_id}")
        result = scanner.create_baseline(host_id)
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error creating baseline: {e}")
        return jsonify(format_error(str(e))), 500


@integrity_bp.route('/scans', methods=['GET'])
@integrity_bp.route('/scans/<host_id>', methods=['GET'])
def list_scans(host_id=None):
    """
    GET /api/integrity/scans
    GET /api/integrity/scans/<host_id>
    
    List all scan jobs, optionally filtered by host.
    
    Returns:
        JSON array of scan summaries
    """
    try:
        logger.debug(f"Listing scans for host: {host_id or 'all'}")
        scans = scanner.list_scans(host_id)
        
        return jsonify({
            'scans': scans,
            'count': len(scans)
        }), 200
        
    except Exception as e:
        logger.error(f"Error listing scans: {e}")
        return jsonify(format_error(str(e))), 500


@integrity_bp.route('/health', methods=['GET'])
def health_check():
    """
    GET /api/integrity/health
    
    Health check for integrity scanner service.
    
    Returns:
        JSON with service status
    """
    return jsonify({
        'status': 'healthy',
        'service': 'integrity_scanner',
        'active_scans': sum(1 for s in scanner.scans.values() if s['status'] == 'running'),
        'total_scans': len(scanner.scans),
        'baselines_count': len(scanner.baselines)
    }), 200
