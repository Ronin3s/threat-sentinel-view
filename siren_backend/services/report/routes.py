"""
Report Generation Routes - Flask Blueprint

Provides REST API endpoints for incident report generation.

Endpoints:
    POST /api/report/generate/<incident_id>     - Generate report
    GET  /api/report/download/<report_id>       - Download report
    GET  /api/report/list                       - List all reports
    GET  /api/report/<report_id>                - Get report details
    GET  /api/report/incidents                  - List incidents
    GET  /api/report/incident/<incident_id>     - Get incident details
    POST /api/report/custom                     - Create custom report
"""

from flask import Blueprint, jsonify, request
import logging
from .generator import ReportGenerator

logger = logging.getLogger(__name__)

report_bp = Blueprint('report', __name__)
generator = ReportGenerator()


@report_bp.route('/generate/<incident_id>', methods=['POST'])
def generate_report(incident_id):
    """
    POST /api/report/generate/<incident_id>
    
    Generate incident report.
    
    Request Body (optional):
        {
            "format": "json|html|pdf"
        }
    
    Returns:
        Report generation result with download URL
    """
    try:
        data = request.get_json() if request.is_json else {}
        report_format = data.get('format', 'json')
        
        result = generator.generate_report(incident_id, report_format)
        status_code = 200 if result.get('status') == 'success' else 400
        return jsonify(result), status_code
        
    except Exception as e:
        logger.error(f"Error generating report: {e}")
        return jsonify({'error': str(e)}), 500


@report_bp.route('/download/<report_id>', methods=['GET'])
def download_report(report_id):
    """
    GET /api/report/download/<report_id>?format=json
    
    Download a generated report.
    
    Query Parameters:
        format: Output format (json, html, pdf) - default: json
    
    Returns:
        Report content in specified format
    """
    try:
        format = request.args.get('format', 'json')
        result = generator.download_report(report_id, format)
        
        if result.get('status') == 'not_found':
            return jsonify(result), 404
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error downloading report: {e}")
        return jsonify({'error': str(e)}), 500


@report_bp.route('/list', methods=['GET'])
def list_reports():
    """
    GET /api/report/list?incident_id=<id>
    
    List all generated reports.
    
    Query Parameters:
        incident_id: Optional filter by incident
    
    Returns:
        Array of report summaries
    """
    try:
        incident_id = request.args.get('incident_id', None)
        reports = generator.list_reports(incident_id)
        
        return jsonify({
            'reports': reports,
            'count': len(reports)
        }), 200
        
    except Exception as e:
        logger.error(f"Error listing reports: {e}")
        return jsonify({'error': str(e)}), 500


@report_bp.route('/<report_id>', methods=['GET'])
def get_report(report_id):
    """
    GET /api/report/<report_id>
    
    Get report details.
    
    Returns:
        Complete report data
    """
    try:
        report = generator.get_report(report_id)
        
        if report.get('status') == 'not_found':
            return jsonify(report), 404
        
        return jsonify(report), 200
        
    except Exception as e:
        logger.error(f"Error fetching report: {e}")
        return jsonify({'error': str(e)}), 500


@report_bp.route('/incidents', methods=['GET'])
def list_incidents():
    """
    GET /api/report/incidents
    
    List all incidents.
    
    Returns:
        Array of incident summaries
    """
    try:
        incidents = generator.list_incidents()
        
        return jsonify({
            'incidents': incidents,
            'count': len(incidents)
        }), 200
        
    except Exception as e:
        logger.error(f"Error listing incidents: {e}")
        return jsonify({'error': str(e)}), 500


@report_bp.route('/incident/<incident_id>', methods=['GET'])
def get_incident(incident_id):
    """
    GET /api/report/incident/<incident_id>
    
    Get incident details.
    
    Returns:
        Complete incident data
    """
    try:
        incident = generator.get_incident(incident_id)
        
        if incident.get('status') == 'not_found':
            return jsonify(incident), 404
        
        return jsonify(incident), 200
        
    except Exception as e:
        logger.error(f"Error fetching incident: {e}")
        return jsonify({'error': str(e)}), 500


@report_bp.route('/custom', methods=['POST'])
def create_custom_report():
    """
    POST /api/report/custom
    
    Create a custom report.
    
    Request Body:
        {
            "title": "Custom Report Title",
            "sections": {
                "section1": "content1",
                "section2": "content2"
            }
        }
    
    Returns:
        Report creation result
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body required'}), 400
        
        title = data.get('title')
        sections = data.get('sections', {})
        
        if not title:
            return jsonify({'error': 'title is required'}), 400
        
        result = generator.create_custom_report(title, sections)
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error creating custom report: {e}")
        return jsonify({'error': str(e)}), 500


@report_bp.route('/health', methods=['GET'])
def health_check():
    """
    GET /api/report/health
    
    Health check for report service.
    
    Returns:
        JSON with service status
    """
    stats = generator.get_statistics()
    
    return jsonify({
        'status': 'healthy',
        'service': 'report_generation',
        'total_reports': stats['total_reports'],
        'total_incidents': stats['total_incidents']
    }), 200
