import { Router } from "express";
import { scan,updateScan } from "../controllers/ScanController";

const router = Router();

router.post("/scan", scan);
router.put("/scan/:id", updateScan);

export default router;