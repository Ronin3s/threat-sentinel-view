"""
Process Monitor Routes - Flask Blueprint

Provides REST API endpoints for process monitoring with risk assessment.

Endpoints:
    GET  /api/process/processes      - List all processes with risk scores
    GET  /api/process/metrics        - Get last 60s of system metrics
    POST /api/process/kill/<pid>     - Terminate a process
    GET  /api/process/health         - Service health check
"""

from flask import Blueprint, jsonify
import psutil
import logging
from .engine import ProcessService, MetricsCollector
from .metrics_buffer import MetricsBuffer

logger = logging.getLogger(__name__)

# Create Blueprint
process_bp = Blueprint('process', __name__)

# Initialize services (singletons for this blueprint)
metrics_buffer = MetricsBuffer(max_size=60)
process_service = ProcessService()
metrics_collector = MetricsCollector(metrics_buffer, interval=1.0)


def init_process_monitor():
    """Initialize and start the metrics collector."""
    logger.info("Initializing Process Monitor service...")
    metrics_collector.start()
    logger.info("Process Monitor service initialized")


def shutdown_process_monitor():
    """Shutdown the metrics collector gracefully."""
    logger.info("Shutting down Process Monitor service...")
    metrics_collector.stop()
    logger.info("Process Monitor service shut down")


@process_bp.route('/processes', methods=['GET'])
def get_processes():
    """
    GET /api/process/processes
    
    Retrieve all running processes with risk assessment.
    
    Returns:
        JSON response with:
            - processes: Array of process objects
            - summary: System summary statistics
    """
    try:
        logger.debug("Fetching all processes")
        result = process_service.get_all_processes()
        return jsonify(result), 200
    
    except Exception as e:
        logger.error(f"Error fetching processes: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500


@process_bp.route('/metrics', methods=['GET'])
def get_metrics():
    """
    GET /api/process/metrics
    
    Retrieve system metrics for the last 60 seconds.
    
    Returns:
        JSON response with CPU and memory usage arrays.
    """
    try:
        logger.debug("Fetching system metrics")
        metrics = metrics_buffer.get_all_metrics()
        return jsonify(metrics), 200
    
    except Exception as e:
        logger.error(f"Error fetching metrics: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500


@process_bp.route('/kill/<int:pid>', methods=['POST'])
def kill_process(pid):
    """
    POST /api/process/kill/<pid>
    
    Terminate a process by PID.
    
    Args:
        pid: Process ID (integer)
    
    Returns:
        JSON response with status and message.
    """
    try:
        logger.info(f"Attempting to kill process {pid}")
        result = process_service.kill_process(pid)
        return jsonify(result), 200
    
    except psutil.NoSuchProcess:
        logger.warning(f"Process {pid} not found")
        return jsonify({
            'status': 'error',
            'message': 'Process not found',
            'pid': pid
        }), 404
    
    except psutil.AccessDenied:
        logger.warning(f"Access denied to kill process {pid}")
        return jsonify({
            'status': 'error',
            'message': 'Access denied - insufficient permissions',
            'pid': pid
        }), 403
    
    except psutil.TimeoutExpired:
        logger.error(f"Timeout killing process {pid}")
        return jsonify({
            'status': 'error',
            'message': 'Process termination timed out',
            'pid': pid
        }), 500
    
    except Exception as e:
        logger.error(f"Error killing process {pid}: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'pid': pid
        }), 500


@process_bp.route('/health', methods=['GET'])
def health_check():
    """
    GET /api/process/health
    
    Health check endpoint for process monitoring service.
    
    Returns:
        JSON with service status.
    """
    return jsonify({
        'status': 'healthy',
        'service': 'process_monitor',
        'metrics_collector_running': metrics_collector.is_running(),
        'metrics_buffer_size': metrics_buffer.get_size()
    }), 200
