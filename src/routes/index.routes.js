import { Router } from "express";
import { prueba } from "../controllers/prueba.controllers.js";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";

const router = Router();

router.route("/prueba").get(prueba);

router.use("/auth", authRoutes);
router.use("/usuarios", userRoutes);

export default router;
