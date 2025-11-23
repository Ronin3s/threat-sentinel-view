"""
Configuration Management

Centralized configuration for the Siren Backend application.
"""

import os
from typing import Dict, Any


class Config:
    """Application configuration."""
    
    # Server configuration
    HOST = os.getenv('SIREN_HOST', '0.0.0.0')
    PORT = int(os.getenv('SIREN_PORT', 8000))
    DEBUG = os.getenv('SIREN_DEBUG', 'False').lower() == 'true'
    
    # Logging configuration
    LOG_LEVEL = os.getenv('SIREN_LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('SIREN_LOG_FILE', None)
    
    # CORS configuration
    CORS_ORIGINS = os.getenv('SIREN_CORS_ORIGINS', '*')
    
    # Service-specific configurations
    PROCESS_MONITOR_INTERVAL = float(os.getenv('PROCESS_MONITOR_INTERVAL', 1.0))
    METRICS_BUFFER_SIZE = int(os.getenv('METRICS_BUFFER_SIZE', 60))
    
    @classmethod
    def get_config(cls) -> Dict[str, Any]:
        """
        Get all configuration as a dictionary.
        
        Returns:
            Dictionary of all configuration values
        """
        return {
            'host': cls.HOST,
            'port': cls.PORT,
            'debug': cls.DEBUG,
            'log_level': cls.LOG_LEVEL,
            'cors_origins': cls.CORS_ORIGINS,
        }
    
    @classmethod
    def print_config(cls) -> None:
        """Print current configuration (for debugging)."""
        print("=" * 60)
        print("Siren Backend Configuration")
        print("=" * 60)
        for key, value in cls.get_config().items():
            print(f"{key:20s}: {value}")
        print("=" * 60)


# Export singleton instance
config = Config()
