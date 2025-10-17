# SecureWatch Pro - Mock Backend Server

This is a simulated backend server for the SecureWatch Pro dashboard. It provides mock API endpoints for development and testing.

## Setup

```bash
cd backend
npm install
```

## Running the Server

```bash
npm start
# or for development with auto-reload
npm run dev
```

The server will run on `http://localhost:4000`

## Available Endpoints

### Scan Routes (`/api/scan`)

- **POST** `/api/scan/start` - Initiate a new host scan
  - Body: `{ "hostId": "WIN-SRV-01" }`
  - Response: `{ "message": "Scan initiated", "status": "in_progress", "jobId": "scan-xxx" }`

- **GET** `/api/scan/results` - Get scan results
  - Response: Array of file scan results with status, hash, and metadata

### Process Monitor Routes (`/api/monitor`)

- **GET** `/api/monitor/processes` - Get all running processes
  - Response: `{ "processes": [...], "summary": { "total": 8, "highRisk": 2, "systemLoad": 65 } }`

- **POST** `/api/monitor/kill/:pid` - Terminate a process
  - Response: `{ "message": "Process terminated", "status": "success", "pid": 1234 }`

- **GET** `/api/monitor/metrics` - Get CPU and Memory usage over time
  - Response: `{ "cpu": [...], "memory": [...] }`

## Integration with Python Agent

For production use, replace these mock endpoints with calls to a Python agent:

```python
# Python Agent (Future Implementation)
# Run on localhost:5001

from flask import Flask, jsonify, request
import psutil
import hashlib
import os

app = Flask(__name__)

@app.route('/start_scan', methods=['POST'])
def start_scan():
    # Implement real file system scanning
    # Use psutil, hashlib for integrity checks
    return jsonify({"status": "scanning", "jobId": "xxx"})

@app.route('/get_processes', methods=['GET'])
def get_processes():
    processes = []
    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info']):
        try:
            pinfo = proc.info
            processes.append({
                'pid': pinfo['pid'],
                'name': pinfo['name'],
                'cpu': pinfo['cpu_percent'],
                'mem': pinfo['memory_info'].rss / (1024 * 1024),  # Convert to MB
                'risk': assess_risk(pinfo),  # Custom risk assessment
                'status': 'Running'
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    return jsonify({'processes': processes})

@app.route('/kill_process/<int:pid>', methods=['POST'])
def kill_process(pid):
    try:
        p = psutil.Process(pid)
        p.terminate()
        return jsonify({"status": "success", "pid": pid})
    except psutil.NoSuchProcess:
        return jsonify({"status": "error", "message": "Process not found"}), 404

def assess_risk(proc_info):
    # Implement risk assessment logic
    # Check against known suspicious processes, behaviors, etc.
    suspicious_names = ['powershell.exe', 'cmd.exe', 'rundll32.exe']
    if proc_info['name'] in suspicious_names:
        return 'High'
    elif proc_info['cpu_percent'] > 50:
        return 'Medium'
    return 'Low'

if __name__ == '__main__':
    app.run(port=5001)
```

## Frontend Integration

The frontend connects to these endpoints via `http://localhost:4000`. To connect to a real Python agent:

1. Update backend routes to proxy requests to Python agent
2. Or update frontend API calls to point directly to `http://localhost:5001`
3. Implement proper error handling and authentication

## Next Steps

1. Implement Python agent with real system scanning capabilities
2. Add WebSocket support for real-time process monitoring
3. Implement authentication and authorization
4. Add database integration for persistent storage
5. Add logging and monitoring for the backend itself
6. Implement rate limiting and security measures
