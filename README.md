# SIREN - Smart Incident Response & Event Notifier

<div align="center">

![SIREN Logo](./risk-analysis.png)

**Advanced Security Operations Center (SOC) Platform**

A comprehensive cybersecurity incident response platform with real-time monitoring, threat detection, and automated containment capabilities.

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-green.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-orange.svg)](https://flask.palletsprojects.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 🎯 Overview

SIREN is a modern, enterprise-grade Security Operations Center (SOC) platform designed for real-time cybersecurity incident detection, monitoring, and automated response. It provides security analysts with powerful tools to:

- **Monitor** system processes and detect anomalies in real-time
- **Scan** hosts for file integrity violations and baseline deviations
- **Hunt** for Indicators of Compromise (IOCs) across infrastructure
- **Detect** behavioral anomalies using rule-based detection
- **Contain** threats with automated isolation and blocking
- **Report** incidents with comprehensive forensic evidence

---

## ✨ Features

### 🔍 Process Monitor
- Real-time Windows process enumeration
- Multi-factor risk scoring algorithm
- CPU and memory usage tracking
- Process termination capability
- 60-second rolling metrics buffer

### 🛡️ Integrity Scanner
- File system scanning with hash calculation (MD5/SHA256)
- Baseline creation and comparison
- Change detection (new/modified/deleted files)
- Path-based risk assessment
- Deviation reporting

### 🎯 IOC Hunting
- Cross-host IOC search
- Support for 5 IOC types:
  - File Hashes (MD5/SHA256)
  - IP Addresses
  - Domain Names
  - URLs
  - Email Addresses
- Prevalence analysis
- Evidence correlation

### 👁️ Behavioral Monitoring
- Real-time process behavior tracking
- 5 pre-configured detection rules
- Anomaly detection
- Event simulation for testing
- Rule-based pattern matching

### 🚨 Automated Containment
- Host network isolation
- IP address blocking
- File quarantine
- Action audit trail
- Rollback capabilities

### 📊 Incident Reporting
- Comprehensive incident reports
- Timeline reconstruction
- Evidence aggregation
- Automated recommendations
- Multi-format export (JSON, HTML)

---

## 🏗️ Architecture

SIREN follows a microservices architecture with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│         React Frontend (Vite)           │
│    Port: 5173 (Development)             │
│    - TypeScript + Tailwind CSS          │
│    - shadcn/ui Components               │
│    - Framer Motion Animations           │
└──────────────┬──────────────────────────┘
               │ HTTP/REST API
               │
┌──────────────▼──────────────────────────┐
│      Python Flask Backend API           │
│         Port: 8000                      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   6 Microservices (Blueprints)  │   │
│  │  - Process Monitor              │   │
│  │  - Integrity Scanner            │   │
│  │  - IOC Hunting                  │   │
│  │  - Behavior Monitor             │   │
│  │  - Containment                  │   │
│  │  - Report Generation            │   │
│  └─────────────────────────────────┘   │
└──────────────┬──────────────────────────┘
               │
               ▼
      Windows Host (psutil)
```

---

## 📦 Prerequisites

Before installing SIREN, ensure you have the following installed:

### Required
- **Node.js** v18.x or higher ([Download](https://nodejs.org/))
- **npm** v9.x or higher (comes with Node.js)
- **Python** 3.8 or higher ([Download](https://www.python.org/))
- **pip** (Python package manager)

### Recommended
- **Git** for version control
- **VS Code** or similar IDE
- **Windows OS** (for full process monitoring features)

### Check Your Installation
```bash
node --version    # Should be v18.x or higher
npm --version     # Should be v9.x or higher
python --version  # Should be 3.8 or higher
pip --version     # Should be installed
```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd threat-sentinel-view
```

### 2. Install Frontend Dependencies

```bash
npm install
```

This will install all required frontend packages including:
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Recharts
- Framer Motion
- And more...

### 3. Install Backend Dependencies

```bash
cd siren_backend
pip install -r requirements.txt
```

This installs the Python backend dependencies:
- Flask 3.0.0
- flask-cors 4.0.0
- psutil 5.9.6

### 4. Environment Configuration (Optional)

Create a `.env` file in the root directory:

```bash
# Frontend
VITE_API_URL=http://localhost:8000

# Backend (can be set as environment variables)
# SIREN_PORT=8000
# SIREN_CORS_ORIGINS=http://localhost:5173
```

---

## 🏃 Running the Project

### Quick Start (Two Terminal Windows)

#### Terminal 1: Start Backend Server

```bash
cd siren_backend
python app.py
```

Expected output:
```
[INFO] SIREN Backend starting on http://0.0.0.0:8000
[INFO] Process Monitor initialized
[INFO] Integrity Scanner initialized
[INFO] IOC Hunter initialized
[INFO] Behavior Watcher initialized
[INFO] Containment Actions initialized
[INFO] Report Generator initialized
 * Running on http://0.0.0.0:8000
```

#### Terminal 2: Start Frontend Dev Server

```bash
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

---

## 📖 Usage Guide

### 1. Dashboard Overview

The main dashboard provides:
- **Total Incidents**: Count of all security incidents
- **Active Incidents**: Currently ongoing incidents
- **Resolved Today**: Incidents resolved in the last 24 hours
- **Critical Alerts**: High-severity behavioral events

**Actions:**
- Click **Refresh** to reload dashboard data
- Auto-refreshes every 30 seconds

---

### 2. Process Monitor

**Path:** `/process-monitor`

Monitor running processes with risk assessment in real-time.

**How to Use:**
1. Click **"Load Processes"** to fetch current running processes
2. View process list with:
   - PID (Process ID)
   - Process Name
   - User
   - CPU Usage
   - Memory Usage
   - Risk Score (0-100)
   - Status
3. Click **"Kill"** on any process to terminate it
4. Click **"Refresh"** to update the list
5. View live CPU/Memory charts (updates every 5 seconds)

**Risk Scoring:**
- 🔴 **High (70-100)**: Suspicious processes requiring immediate attention
- 🟡 **Medium (40-69)**: Moderately suspicious processes
- 🟢 **Low (0-39)**: Normal processes

---

### 3. Host Integrity Scanner

**Path:** `/host-scan`

Scan hosts for file system changes and baseline deviations.

**How to Use:**
1. Enter a host ID in the input field (e.g., `WIN-SRV-01`)
2. Click **"Start Scan"**
3. Wait for scan to complete (usually 1-3 seconds)
4. Review results:
   - **Baseline Score**: Overall integrity score (0-100)
   - **Files Scanned**: Number of files checked
   - **Changes Detected**: List of new/modified/deleted files
   - **Severity**: Overall risk level

**Change Types:**
- **New**: File added since baseline
- **Modified**: File content changed (hash mismatch)
- **Deleted**: File removed since baseline

---

### 4. IOC Hunting

**Path:** `/ioc-hunt`

Search for Indicators of Compromise across your infrastructure.

**How to Use:**
1. Select **IOC Type** from dropdown:
   - File Hash (MD5/SHA256)
   - IP Address
   - Domain Name
   - URL
   - Email Address
2. Enter the **IOC Value** (e.g., hash, IP, domain)
3. Click **"Start Hunt"**
4. Review matches:
   - Host where IOC was found
   - Evidence location
   - First seen timestamp
   - Confidence level

**Example IOC Values:**
```
File Hash:   b40f6b2c167239519fcfb2028ab2524a
IP Address:  192.168.1.100
Domain:      malicious-domain.com
URL:         http://malicious-site.com/payload
Email:       attacker@malicious.com
```

---

### 5. Behavior Monitor

**Path:** `/behavior-monitor`

Monitor runtime process behaviors and detect anomalies.

**How to Use:**
1. Click **"Load Events"** to fetch behavioral events
2. Click **"Simulate Events"** to generate 10 test events
3. Review event table showing:
   - Timestamp
   - Host
   - Process name and PID
   - Detected behaviors
   - Severity level
   - Confidence score
4. Click **"Refresh"** to update statistics
5. Click **"Clear"** (trash icon) to remove all events

**Detection Rules:**
- **BR-001**: Encoded Command Execution
- **BR-002**: Child Process from Temp Directory
- **BR-003**: Registry Modification
- **BR-004**: Process Injection
- **BR-005**: Network Anomaly

---

### 6. Backend Status

**Path:** `/backend-status`

Monitor the health of all backend microservices.

**Features:**
- Real-time health checks
- Service status indicators
- Uptime monitoring
- Auto-refresh every 10 seconds

---

## 📡 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Global Endpoints

#### Health Check
```http
GET /api/health
```

Returns overall system health and service status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-25T15:00:00Z",
  "services": {
    "process_monitor": { "status": "healthy" },
    "integrity_scanner": { "status": "healthy" },
    "ioc_hunting": { "status": "healthy" },
    "behavior_monitor": { "status": "healthy" },
    "containment": { "status": "healthy" },
    "report_generation": { "status": "healthy" }
  }
}
```

---

### Process Monitor Endpoints

#### Get Processes
```http
GET /api/process/processes
```

Returns list of running processes with risk scores.

#### Get Metrics
```http
GET /api/process/metrics
```

Returns system metrics (CPU, memory) for last 60 seconds.

#### Kill Process
```http
POST /api/process/kill/{pid}
```

Terminates a process by PID.

---

### Integrity Scanner Endpoints

#### Start Scan
```http
POST /api/integrity/scan/{host_id}
```

**Body (optional):**
```json
{
  "scan_paths": ["C:\\Windows\\System32", "C:\\Program Files"]
}
```

#### Get Scan Results
```http
GET /api/integrity/results/{job_id}
```

---

### IOC Hunting Endpoints

#### Start Hunt
```http
POST /api/ioc/hunt
```

**Body:**
```json
{
  "ioc_type": "file_hash",
  "ioc_value": "b40f6b2c167239519fcfb2028ab2524a"
}
```

#### Get Hunt Results
```http
GET /api/ioc/results/{hunt_id}
```

---

### Behavior Monitor Endpoints

#### Get Events
```http
GET /api/behavior/events?limit=50&severity=high
```

#### Simulate Events (Testing)
```http
POST /api/behavior/simulate
```

**Body:**
```json
{
  "event_count": 10
}
```

---

## 📁 Project Structure

```
threat-sentinel-view/
├── siren_backend/              # Python Flask Backend
│   ├── app.py                  # Main Flask application
│   ├── requirements.txt        # Python dependencies
│   ├── services/               # Microservices
│   │   ├── process_monitor/    # Process monitoring
│   │   ├── integrity_scanner/  # File integrity checking
│   │   ├── ioc_hunting/        # IOC search engine
│   │   ├── behavior_monitor/   # Behavior detection
│   │   ├── containment/        # Automated response
│   │   └── report/             # Report generation
│   └── utils/                  # Shared utilities
│       ├── logger.py           # Logging configuration
│       ├── config.py           # Configuration management
│       └── common.py           # Common functions
│
├── src/                        # React Frontend
│   ├── components/             # React components
│   │   ├── dashboard/          # Dashboard components
│   │   ├── layout/             # Layout components
│   │   └── ui/                 # shadcn/ui components
│   ├── pages/                  # Page components
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── ProcessMonitor.tsx  # Process monitoring
│   │   ├── HostScan.tsx        # Integrity scanning
│   │   ├── IOCHunt.tsx         # IOC hunting
│   │   └── BehaviorMonitor.tsx # Behavior monitoring
│   ├── lib/                    # Utilities
│   │   ├── api.ts              # API client (500+ lines)
│   │   └── utils.ts            # Helper functions
│   ├── config/                 # Configuration
│   │   └── api.ts              # API configuration
│   └── App.tsx                 # Main app component
│
├── public/                     # Static assets
│   ├── favicon.png             # Favicon (risk-analysis)
│   └── robots.txt              # SEO configuration
│
├── index.html                  # HTML entry point
├── package.json                # NPM dependencies
├── vite.config.ts              # Vite configuration
├── tailwind.config.ts          # Tailwind CSS config
└── README.md                   # This file
```

---

## 🛠️ Development

### Available Scripts

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

#### Backend
```bash
python app.py        # Start Flask server
```

### Adding New Features

1. **Backend Service**: Create new Blueprint in `siren_backend/services/`
2. **Frontend Page**: Add component in `src/pages/`
3. **API Integration**: Update `src/lib/api.ts` with new endpoints
4. **Routing**: Add route in `src/App.tsx`

### Code Style

- **Frontend**: TypeScript with ESLint
- **Backend**: Python with type hints
- **Formatting**: Prettier (frontend), Black (backend)

---

## 🐛 Troubleshooting

### Backend Won't Start

**Problem:** `ModuleNotFoundError: No module named 'flask'`

**Solution:**
```bash
cd siren_backend
pip install -r requirements.txt
```

---

### Frontend Build Errors

**Problem:** `Cannot find module '@/components/...'`

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

### API Connection Errors

**Problem:** `Failed to fetch` or `Network Error`

**Solutions:**
1. Ensure backend is running on port 8000
2. Check CORS configuration in backend
3. Verify `VITE_API_URL` in `.env` file
4. Clear browser cache and reload

---

### Process Monitor Shows No Data

**Problem:** Process list is empty

**Solutions:**
1. Click "Load Processes" button
2. Check backend logs for errors
3. Ensure psutil is installed: `pip install psutil`
4. On Linux/Mac, may need elevated permissions

---

### Port Already in Use

**Problem:** `Address already in use`

**Solution:**
```bash
# Find process using port 8000
lsof -i :8000
kill -9 <PID>

# Or use different port
SIREN_PORT=8001 python app.py
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Authors

- **Project Team** - Initial work and development

---

## 🙏 Acknowledgments

- **Flask** - Backend framework
- **React** - Frontend framework
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Styling framework
- **Framer Motion** - Animation library
- **Recharts** - Charting library

---

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Contact the development team

---

<div align="center">

**Built with ❤️ for Cybersecurity Professionals**

SIREN - Smart Incident Response & Event Notifier

</div>
