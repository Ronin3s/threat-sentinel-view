import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get("/results", (req, res) => {
  const dataPath = path.join(__dirname, "../mock/scanResults.json");
  const data = fs.readFileSync(dataPath, "utf8");
  
  // Simulate scanning delay
  setTimeout(() => {
    res.json(JSON.parse(data));
  }, 1500);
});

router.post("/start", (req, res) => {
  const { hostId } = req.body;
  
  // Simulate scan initiation
  setTimeout(() => {
    res.json({
      message: "Scan initiated successfully",
      status: "in_progress",
      jobId: `scan-${Date.now()}`,
      host: hostId || "WIN-SRV-01"
    });
  }, 300);
});

export default router;
