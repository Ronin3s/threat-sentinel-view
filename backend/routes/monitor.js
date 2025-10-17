import express from "express";

const router = express.Router();

// Mock process data
let processes = [
  { pid: 2412, name: "chrome.exe", cpu: 12, mem: 210, risk: "Low", status: "Running" },
  { pid: 3550, name: "powershell.exe", cpu: 35, mem: 150, risk: "High", status: "Running" },
  { pid: 782, name: "svchost.exe", cpu: 8, mem: 98, risk: "Medium", status: "Running" },
  { pid: 4421, name: "explorer.exe", cpu: 5, mem: 145, risk: "Low", status: "Running" },
  { pid: 1024, name: "cmd.exe", cpu: 22, mem: 85, risk: "Medium", status: "Running" },
  { pid: 5678, name: "suspicious.exe", cpu: 45, mem: 320, risk: "High", status: "Running" },
  { pid: 9012, name: "notepad.exe", cpu: 2, mem: 45, risk: "Low", status: "Running" },
  { pid: 3344, name: "rundll32.exe", cpu: 18, mem: 112, risk: "Medium", status: "Running" }
];

// Get all processes
router.get("/processes", (req, res) => {
  // Simulate slight variations in CPU/Memory
  const dynamicProcesses = processes.map(proc => ({
    ...proc,
    cpu: Math.max(0, proc.cpu + Math.floor(Math.random() * 10 - 5)),
    mem: Math.max(0, proc.mem + Math.floor(Math.random() * 20 - 10))
  }));
  
  setTimeout(() => {
    res.json({
      processes: dynamicProcesses,
      summary: {
        total: dynamicProcesses.length,
        highRisk: dynamicProcesses.filter(p => p.risk === "High").length,
        systemLoad: Math.floor(Math.random() * 30 + 50) // 50-80%
      }
    });
  }, 500);
});

// Kill a process
router.post("/kill/:pid", (req, res) => {
  const pid = parseInt(req.params.pid);
  const processIndex = processes.findIndex(p => p.pid === pid);
  
  if (processIndex !== -1) {
    const processName = processes[processIndex].name;
    processes = processes.filter(p => p.pid !== pid);
    
    setTimeout(() => {
      res.json({ 
        message: `Process ${processName} (PID: ${pid}) terminated successfully`, 
        status: "success",
        pid: pid
      });
    }, 300);
  } else {
    res.status(404).json({ 
      message: `Process with PID ${pid} not found`, 
      status: "error" 
    });
  }
});

// Get system metrics for charts
router.get("/metrics", (req, res) => {
  const now = Date.now();
  const metrics = {
    cpu: Array.from({ length: 20 }, (_, i) => ({
      time: new Date(now - (19 - i) * 3000).toLocaleTimeString(),
      usage: Math.floor(Math.random() * 40 + 30)
    })),
    memory: Array.from({ length: 20 }, (_, i) => ({
      time: new Date(now - (19 - i) * 3000).toLocaleTimeString(),
      usage: Math.floor(Math.random() * 30 + 50)
    }))
  };
  
  res.json(metrics);
});

export default router;
