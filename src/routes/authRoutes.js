import express from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  getSession,
  verifyEmail,
  resendVerificationCode,
  requestPasswordRecovery,
  verifyRecoveryCode,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

// Registro y verificación de usuarios
router.post("/register", registerUser);
router.post("/verificar-correo", verifyEmail);
router.post("/reenviar-codigo", resendVerificationCode);

// Inicio y cierre de sesión
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/sesion", getSession);

// Recuperación de contraseña
router.post("/solicitar-recuperacion", requestPasswordRecovery);
router.post("/verificar-recuperacion", verifyRecoveryCode);
router.post("/restablecer-password", resetPassword);

export default router;
