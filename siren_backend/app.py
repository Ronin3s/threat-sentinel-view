"""
Siren Backend - Unified Security Operations Platform

Main Flask application that orchestrates all security services:
- Process Monitor
- Integrity Scanner
- IOC Hunting
- Behavior Monitor
- Containment Actions
- Report Generation

Author: Siren Backend Team
Version: 1.0.0
"""

import signal
import sys
import logging
from flask import Flask, jsonify
from flask_cors import CORS

# Import utilities
from utils.logger import setup_logging, get_logger
from utils.config import config

# Import service blueprints
from services.process_monitor.routes import process_bp, init_process_monitor, shutdown_process_monitor
from services.integrity_scanner.routes import integrity_bp
from services.ioc_hunting.routes import ioc_bp
from services.behavior_monitor.routes import behavior_bp
from services.containment.routes import containment_bp
from services.report.routes import report_bp

# Setup logging
setup_logging(level=config.LOG_LEVEL, log_file=config.LOG_FILE)
logger = get_logger(__name__)

# Create Flask app
app = Flask(__name__)

# Enable CORS for frontend integration
CORS(app, origins=config.CORS_ORIGINS)


# ============================================================================
# Register Service Blueprints
# ============================================================================

app.register_blueprint(process_bp, url_prefix='/api/process')
app.register_blueprint(integrity_bp, url_prefix='/api/integrity')
app.register_blueprint(ioc_bp, url_prefix='/api/ioc')
app.register_blueprint(behavior_bp, url_prefix='/api/behavior')
app.register_blueprint(containment_bp, url_prefix='/api/contain')
app.register_blueprint(report_bp, url_prefix='/api/report')

logger.info("Registered blueprints: process, integrity, ioc, behavior, contain, report")


# ============================================================================
# Global Endpoints
# ============================================================================

@app.route('/', methods=['GET'])
def root():
    """Root endpoint - API information"""
    return jsonify({
        'name': 'Siren Backend API',
        'version': '1.0.0',
        'status': 'online',
        'documentation': '/api/health'
    }), 200


@app.route('/api/health', methods=['GET'])
def global_health():
    """
    GET /api/health
    
    Global health check endpoint for all services.
    
    Returns:
        JSON with overall status and service list
    """
    return jsonify({
        'status': 'healthy',
        'server': 'siren_backend',
        'version': '1.0.0',
        'services': {
            'process_monitor': {
                'status': 'active',
                'endpoint': '/api/process/health'
            },
            'integrity_scanner': {
                'status': 'active',
                'endpoint': '/api/integrity/scan/<host_id>'
            },
            'ioc_hunting': {
                'status': 'active',
                'endpoint': '/api/ioc/hunt'
            },
            'behavior_monitor': {
                'status': 'active',
                'endpoint': '/api/behavior/events'
            },
            'containment': {
                'status': 'active',
                'endpoint': '/api/contain/isolate/<host>'
            },
            'report_generation': {
                'status': 'active',
                'endpoint': '/api/report/generate/<incident_id>'
            }
        }
    }), 200


# ============================================================================
# Error Handlers
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Not found',
        'message': 'The requested endpoint does not exist',
        'status': 404
    }), 404


@app.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors"""
    return jsonify({
        'error': 'Method not allowed',
        'message': 'The HTTP method is not supported for this endpoint',
        'status': 405
    }), 405


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {error}")
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected error occurred',
        'status': 500
    }), 500


# ============================================================================
# Application Lifecycle
# ============================================================================

def initialize_services():
    """Initialize all services that require startup procedures."""
    logger.info("Initializing services...")
    
    # Initialize process monitor (starts metrics collector)
    init_process_monitor()
    
    # TODO: Initialize other services as needed
    
    logger.info("All services initialized successfully")


def shutdown_services():
    """Gracefully shutdown all services."""
    logger.info("Shutting down services...")
    
    # Shutdown process monitor
    shutdown_process_monitor()
    
    # TODO: Shutdown other services as needed
    
    logger.info("All services shut down successfully")


def signal_handler(signum, frame):
    """
    Handle shutdown signals gracefully.
    
    Called when receiving SIGINT (Ctrl+C) or SIGTERM signals.
    """
    logger.info("Received shutdown signal, initiating graceful shutdown...")
    shutdown_services()
    sys.exit(0)


# Register signal handlers
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)


# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == '__main__':
    # Print banner
    print("=" * 70)
    print(" ███████╗██╗██████╗ ███████╗███╗   ██╗")
    print(" ██╔════╝██║██╔══██╗██╔════╝████╗  ██║")
    print(" ███████╗██║██████╔╝█████╗  ██╔██╗ ██║")
    print(" ╚════██║██║██╔══██╗██╔══╝  ██║╚██╗██║")
    print(" ███████║██║██║  ██║███████╗██║ ╚████║")
    print(" ╚══════╝╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝")
    print()
    print(" Unified Security Operations Backend")
    print(" Version 1.0.0")
    print("=" * 70)
    print()
    
    # Print configuration
    logger.info("Starting Siren Backend...")
    config.print_config()
    print()
    
    # Print registered endpoints
    logger.info("Registered API Endpoints:")
    logger.info("  GET  /                                    - API info")
    logger.info("  GET  /api/health                          - Global health check")
    logger.info("")
    logger.info("  Process Monitor:")
    logger.info("    GET  /api/process/processes             - List all processes")
    logger.info("    GET  /api/process/metrics               - System metrics (60s)")
    logger.info("    POST /api/process/kill/<pid>            - Terminate process")
    logger.info("    GET  /api/process/health                - Service health")
    logger.info("")
    logger.info("  Integrity Scanner:")
    logger.info("    POST /api/integrity/scan/<host_id>      - Start scan")
    logger.info("    GET  /api/integrity/results/<job_id>    - Get results")
    logger.info("")
    logger.info("  IOC Hunting:")
    logger.info("    POST /api/ioc/hunt                      - Start hunt")
    logger.info("    GET  /api/ioc/results/<hunt_id>         - Get results")
    logger.info("")
    logger.info("  Behavior Monitor:")
    logger.info("    GET  /api/behavior/events               - Get events")
    logger.info("    GET  /api/behavior/stream               - Stream events")
    logger.info("")
    logger.info("  Containment:")
    logger.info("    POST /api/contain/isolate/<host>        - Isolate host")
    logger.info("    POST /api/contain/block/<ip>            - Block IP")
    logger.info("")
    logger.info("  Report Generation:")
    logger.info("    POST /api/report/generate/<incident_id> - Generate report")
    logger.info("    GET  /api/report/download/<report_id>   - Download report")
    print()
    print("=" * 70)
    print()
    
    # Initialize services
    initialize_services()
    
    # Start Flask server
    logger.info(f"Starting Flask server on {config.HOST}:{config.PORT}...")
    app.run(
        host=config.HOST,
        port=config.PORT,
        debug=config.DEBUG,
        use_reloader=False  # Disable reloader to prevent duplicate services
    )
