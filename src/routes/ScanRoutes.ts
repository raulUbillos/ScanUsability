import { Router } from "express";
import { deleteScan, getScanById, getScanList, scan,updateScan,exportCSV } from "../controllers/ScanController";

const router = Router();

router.post("/scan", scan);
router.get("/scan/list", getScanList);
router.get("/scan/csvExport",exportCSV );
router.get("/scan/csvExport/:id",exportCSV );
router.get("/scan/:id", getScanById);
router.put("/scan/:id", updateScan);
router.delete("/scan/:id", deleteScan);

export default router;