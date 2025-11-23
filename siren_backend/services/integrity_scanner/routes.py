"""
Integrity Scanner Routes - Flask Blueprint

Provides REST API endpoints for host integrity scanning and baseline monitoring.

Endpoints:
    POST /api/integrity/scan/<host_id>     - Start integrity scan
    GET  /api/integrity/results/<job_id>   - Get scan results
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
    
    Args:
        host_id: Host identifier
    
    Returns:
        JSON with job_id and status
    """
    try:
        logger.info(f"Starting integrity scan for host: {host_id}")
        result = scanner.start_scan(host_id)
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error starting scan: {e}")
        return jsonify(format_error(str(e))), 500


@integrity_bp.route('/results/<job_id>', methods=['GET'])
def get_results(job_id):
    """
    GET /api/integrity/results/<job_id>
    
    Retrieve scan results.
    
    Args:
        job_id: Scan job identifier
    
    Returns:
        JSON with scan results
    """
    try:
        logger.debug(f"Fetching results for job: {job_id}")
        result = scanner.get_results(job_id)
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error fetching results: {e}")
        return jsonify(format_error(str(e))), 500
