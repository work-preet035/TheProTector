import { Router, type IRouter } from "express";
import healthRouter from "./health";
import cipherRouter from "./cipher";

const router: IRouter = Router();

router.use(healthRouter);
router.use(cipherRouter);

export default router;
