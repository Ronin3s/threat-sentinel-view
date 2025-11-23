"""
Report Routes - Flask Blueprint
Endpoints:
    POST /api/report/generate/<incident_id>   - Generate incident report
    GET  /api/report/download/<report_id>     - Download report
"""

from flask import Blueprint, jsonify
import logging
from .generator import ReportGenerator

logger = logging.getLogger(__name__)

report_bp = Blueprint('report', __name__)
generator = ReportGenerator()


@report_bp.route('/generate/<incident_id>', methods=['POST'])
def generate_report(incident_id):
    """POST /api/report/generate/<incident_id> - Generate report"""
    try:
        result = generator.generate(incident_id)
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error generating report: {e}")
        return jsonify({'error': str(e)}), 500


@report_bp.route('/download/<report_id>', methods=['GET'])
def download_report(report_id):
    """GET /api/report/download/<report_id> - Download report"""
    try:
        result = generator.get_report(report_id)
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error downloading report: {e}")
        return jsonify({'error': str(e)}), 500
