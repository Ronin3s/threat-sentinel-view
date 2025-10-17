# SecureWatch Pro - Mock Backend Server

This is a simulated backend server for the SecureWatch Pro dashboard. It provides mock API endpoints for development and testing.

## Setup

```bash
npm install express cors
```

## Running the Server

```bash
node backend/server.js
```

The server will run on `http://localhost:4000`

## Available Endpoints

### Scan Routes

- **POST** `/api/scan/start` - Initiate a new host scan
  - Body: `{ "hostId": "WIN-SRV-01" }`
  - Response: `{ "message": "Scan initiated", "status": "in_progress", "jobId": "scan-xxx" }`

- **GET** `/api/scan/results` - Get scan results
  - Response: Array of file scan results with status, hash, and metadata

## Integration with Python Agent

For production use, replace these mock endpoints with calls to a Python agent:

```python
# Python Agent (Future Implementation)
# Run on localhost:5001

from flask import Flask, jsonify
import psutil
import hashlib
import os

app = Flask(__name__)

@app.route('/start_scan', methods=['POST'])
def start_scan():
    # Implement real file system scanning
    # Use psutil, hashlib for integrity checks
    return jsonify({"status": "scanning", "jobId": "xxx"})

@app.route('/results/<job_id>', methods=['GET'])
def get_results(job_id):
    # Return real scan results
    return jsonify(results)
```

## Next Steps

1. Implement Python agent with real system scanning capabilities
2. Replace mock data in `/backend/mock/scanResults.json` with live data
3. Add authentication and authorization
4. Implement WebSocket for real-time updates
5. Add database integration for persistent storage
