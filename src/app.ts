import express from "express";
import ScanRoutes from "./routes/ScanRoutes";

const app = express();

app.use(express.json());
app.use(ScanRoutes);

export default app;