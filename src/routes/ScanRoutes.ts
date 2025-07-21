import { Router } from "express";
import { scan } from "../controllers/ScanController";

const router = Router();

router.post("/scan", scan);

export default router;