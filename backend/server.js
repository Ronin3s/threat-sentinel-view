import express from "express";
import cors from "cors";
import scanRouter from "./routes/scan.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/scan", scanRouter);

app.listen(4000, () => console.log("🔒 SecureWatch Pro Mock Backend running on port 4000"));
