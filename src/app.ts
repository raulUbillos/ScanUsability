import express from "express";
import ScanRoutes from "./routes/ScanRoutes";
import { errorHandler } from "./middlewares/ErrorManager";

const app = express();

app.use(express.json());
app.use(ScanRoutes);
app.use(errorHandler)
export default app;