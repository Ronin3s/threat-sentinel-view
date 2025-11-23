"""
Common Utilities

Shared utility functions used across multiple services.
"""

from datetime import datetime
from typing import Dict, Any, Optional
import json


def get_timestamp() -> str:
    """
    Get current UTC timestamp in ISO 8601 format.
    
    Returns:
        ISO 8601 formatted timestamp string
    """
    return datetime.utcnow().isoformat() + 'Z'


def format_response(
    data: Any = None,
    message: Optional[str] = None,
    status: str = 'success',
    **kwargs
) -> Dict[str, Any]:
    """
    Format a standardized API response.
    
    Args:
        data: Response data
        message: Optional message
        status: Status indicator ('success', 'error', 'pending')
        **kwargs: Additional fields to include in response
    
    Returns:
        Standardized response dictionary
    """
    response = {'status': status}
    
    if message:
        response['message'] = message
    
    if data is not None:
        response['data'] = data
    
    response.update(kwargs)
    
    return response


def format_error(
    message: str,
    error_code: Optional[str] = None,
    details: Optional[Dict] = None
) -> Dict[str, Any]:
    """
    Format a standardized error response.
    
    Args:
        message: Error message
        error_code: Optional error code
        details: Optional error details dictionary
    
    Returns:
        Standardized error response
    """
    error = {
        'status': 'error',
        'message': message
    }
    
    if error_code:
        error['error_code'] = error_code
    
    if details:
        error['details'] = details
    
    return error


def sanitize_path(path: str) -> str:
    """
    Sanitize file paths for safe logging and storage.
    
    Args:
        path: File path to sanitize
    
    Returns:
        Sanitized path string
    """
    # Remove sensitive information, normalize slashes
    return path.replace('\\', '/').strip()


def parse_bool(value: Any) -> bool:
    """
    Parse various input types to boolean.
    
    Args:
        value: Value to parse (string, int, bool)
    
    Returns:
        Boolean value
    """
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.lower() in ('true', 'yes', '1', 'on')
    if isinstance(value, (int, float)):
        return value != 0
    return False


def safe_json_loads(json_str: str, default: Any = None) -> Any:
    """
    Safely parse JSON string with fallback.
    
    Args:
        json_str: JSON string to parse
        default: Default value if parsing fails
    
    Returns:
        Parsed JSON or default value
    """
    try:
        return json.loads(json_str)
    except (json.JSONDecodeError, TypeError):
        return default
