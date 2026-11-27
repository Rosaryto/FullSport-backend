import express from "express";
import authMiddleware, {
  adminMiddleware,
} from "../middlewares/authMiddleware.js";

import { getUserProfile } from "../controllers/userController.js";

const router = express.Router();

// Perfil del usuario autenticado
router.get("/perfil", authMiddleware, getUserProfile);

// Acceso exclusivo para administradores
router.get("/admin", authMiddleware, adminMiddleware, (req, res) => {
  return res.status(200).json({
    mensaje:
      "Acceso autorizado. Bienvenido al panel de administración de FULL SPORT.",
  });
});

export default router;