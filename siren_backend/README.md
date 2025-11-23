# Siren Backend - Unified Security Operations Platform

A unified Python Flask backend for the Threat Sentinel View SOC dashboard, providing modular service architecture with REST API endpoints.

## Architecture

### Unified Backend (Port 8000)
```
siren_backend/
├── app.py                          # Main Flask application
├── requirements.txt                # Dependencies
├── services/                       # Service blueprints
│   ├── process_monitor/           # Process monitoring + metrics
│   ├── integrity_scanner/         # Host baseline scanning
│   ├── ioc_hunting/              # IOC search
│   ├── behavior_monitor/         # Behavioral analysis
│   ├── containment/              # Automated responses
│   └── report/                   # Report generation
└── utils/                         # Shared utilities
    ├── logger.py                 # Centralized logging
    ├── config.py                 # Configuration management
    └── common.py                 # Helper functions
```

## Quick Start

### 1. Install Dependencies

```bash
cd siren_backend
pip install -r requirements.txt
```

### 2. Start the Backend

```bash
python app.py
```

The server will start on `http://0.0.0.0:8000`

### 3. Start the Frontend

```bash
cd ..
npm run dev
```

Frontend will be available on `http://localhost:5173`

## API Endpoints

### Global
- `GET /` - API information
- `GET /api/health` - Global health check

### Process Monitor
- `GET /api/process/processes` - List all running processes with risk scores
- `GET /api/process/metrics` - System CPU/memory metrics (last 60s)
- `POST /api/process/kill/<pid>` - Terminate a process
- `GET /api/process/health` - Service health check

### Integrity Scanner
- `POST /api/integrity/scan/<host_id>` - Start baseline integrity scan
- `GET /api/integrity/results/<job_id>` - Get scan results

### IOC Hunting
- `POST /api/ioc/hunt` - Initiate IOC hunt
- `GET /api/ioc/results/<hunt_id>` - Get hunt results

### Behavior Monitor
- `GET /api/behavior/events` - Get behavioral events
- `GET /api/behavior/stream` - Stream real-time events (WebSocket - pending)

### Containment
- `POST /api/contain/isolate/<host>` - Isolate a host
- `POST /api/contain/block/<ip>` - Block an IP address

### Report Generation
- `POST /api/report/generate/<incident_id>` - Generate incident report
- `GET /api/report/download/<report_id>` - Download report

## Testing

### Test Health Endpoint

```bash
curl http://localhost:8000/api/health | jq
```

Expected response:
```json
{
  "status": "healthy",
  "server": "siren_backend",
  "version": "1.0.0",
  "services": {
    "process_monitor": {
      "status": "active",
      "endpoint": "/api/process/health"
    },
    ...
  }
}
```

### Test Process Monitor

```bash
# List processes
curl http://localhost:8000/api/process/processes | jq

# Get metrics
curl http://localhost:8000/api/process/metrics | jq

# Service health
curl http://localhost:8000/api/process/health | jq
```

## Frontend Integration

### API Configuration

All API calls use the centralized configuration in `src/config/api.ts`:

```typescript
import { API_BASE_URL, API_ENDPOINTS, apiGet, apiPost } from '@/config/api';

// Example usage
const processes = await apiGet(API_ENDPOINTS.process.list);
```

### Backend Status Page

Navigate to `/backend-status` in the frontend to view:
- Server online/offline status
- Service health for all 6 services
- Real-time status updates (auto-refresh every 10s)
- Glassmorphism design with animations

## Service Implementation Status

| Service | Status | Endpoints | Implementation |
|---------|--------|-----------|----------------|
| **Process Monitor** | ✅ Complete | 4 | Fully functional with risk scoring |
| **Integrity Scanner** | 🔸 Skeleton | 2 | Endpoints ready, logic pending |
| **IOC Hunting** | 🔸 Skeleton | 2 | Endpoints ready, logic pending |
| **Behavior Monitor** | 🔸 Skeleton | 2 | Endpoints ready, logic pending |
| **Containment** | 🔸 Skeleton | 2 | Endpoints ready, logic pending |
| **Report Generation** | 🔸 Skeleton | 2 | Endpoints ready, logic pending |

## Configuration

Environment variables (optional):

```bash
export SIREN_HOST=0.0.0.0
export SIREN_PORT=8000
export SIREN_DEBUG=False
export SIREN_LOG_LEVEL=INFO
export SIREN_CORS_ORIGINS=*
```

## Development

### Adding a New Service

1. Create service directory in `services/`
2. Create `routes.py` with Blueprint
3. Create business logic file (e.g., `engine.py`)
4. Register Blueprint in `app.py`

Example:

```python
# services/new_service/routes.py
from flask import Blueprint

new_service_bp = Blueprint('new_service', __name__)

@new_service_bp.route('/endpoint')
def endpoint():
    return {'status': 'ok'}

# app.py
from services.new_service.routes import new_service_bp
app.register_blueprint(new_service_bp, url_prefix='/api/new_service')
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>
```

### Dependencies Missing

```bash
pip install --upgrade -r requirements.txt
```

### CORS Errors

Ensure `flask-cors` is installed and CORS is enabled in `app.py`:

```python
from flask_cors import CORS
CORS(app)
```

## Migration from Old Backend

The old `process_monitor_service/` on port 5001 has been integrated into `siren_backend/` as a Blueprint. All endpoints have been migrated:

| Old Endpoint | New Endpoint |
|--------------|--------------|
| `localhost:5001/processes` | `localhost:8000/api/process/processes` |
| `localhost:5001/metrics` | `localhost:8000/api/process/metrics` |
| `localhost:5001/kill/<pid>` | `localhost:8000/api/process/kill/<pid>` |
| `localhost:5001/health` | `localhost:8000/api/process/health` |

Frontend has been updated automatically via `src/config/api.ts`.

## Production Deployment

### Using Gunicorn

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

### Using Docker

Create `Dockerfile`:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

Build and run:

```bash
docker build -t siren-backend .
docker run -p 8000:8000 siren-backend
```

## License

Same as parent project (Threat Sentinel View)

## Support

For issues, check logs in the console or configure file logging:

```python
# utils/config.py
LOG_FILE = '/var/log/siren_backend.log'
```
