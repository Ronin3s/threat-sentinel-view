import { useEffect, useState, useCallback } from 'react';
import { BehaviorEvent } from '@/api/apiClient';

/**
 * Custom hook to simulate WebSocket behavior event stream
 * 
 * TODO: Replace with actual WebSocket connection
 * const ws = new WebSocket('ws://localhost:4000/telemetry/behavior');
 * ws.onmessage = (event) => {
 *   const behaviorEvent = JSON.parse(event.data);
 *   // handle event
 * };
 */

const generateMockEvent = (): BehaviorEvent => {
  const processes = [
    { name: "powershell.exe", behaviors: ["encoded_command_executed", "child_from_temp_folder", "outbound_conn_unusual"] },
    { name: "cmd.exe", behaviors: ["registry_modification", "scheduled_task_creation", "file_created_startup"] },
    { name: "rundll32.exe", behaviors: ["unusual_dll_load", "process_injection", "network_connection"] },
    { name: "regsvr32.exe", behaviors: ["scriptlet_execution", "remote_file_download", "code_injection"] },
    { name: "mshta.exe", behaviors: ["html_application_execution", "script_execution", "fileless_execution"] }
  ];

  const process = processes[Math.floor(Math.random() * processes.length)];
  const severity = Math.random() > 0.7 ? "high" : Math.random() > 0.4 ? "medium" : "low";
  const confidence = Math.random() > 0.6 ? "high" : "medium";

  return {
    event_id: `beh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: "behavior_alert",
    host: `workstation-${Math.floor(Math.random() * 50) + 1}`,
    process: process.name,
    pid: Math.floor(Math.random() * 9000) + 1000,
    parent: "explorer.exe",
    behavior: process.behaviors.slice(0, Math.floor(Math.random() * 2) + 1),
    confidence,
    severity,
    timestamp: new Date().toISOString()
  };
};

export const useBehaviorStream = () => {
  const [events, setEvents] = useState<BehaviorEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulate WebSocket connection
    setIsConnected(true);

    // Generate new events every 5-10 seconds
    const interval = setInterval(() => {
      const newEvent = generateMockEvent();
      setEvents((prev) => [newEvent, ...prev].slice(0, 100)); // Keep last 100 events
    }, Math.random() * 5000 + 5000);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return { events, isConnected, clearEvents };
};
