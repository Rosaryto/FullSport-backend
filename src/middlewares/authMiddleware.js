import jwt from "jsonwebtoken";

// Verifica la autenticación del usuario
const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        mensaje: "No se proporcionó un token de autenticación",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;
    req.userRol = decoded.rol;

    next();
  } catch (error) {
    return res.status(401).json({
      mensaje: "Token inválido o expirado",
    });
  }
};

// Verifica los permisos de administrador
export const adminMiddleware = (req, res, next) => {
  if (req.userRol !== "admin") {
    return res.status(403).json({
      mensaje: "No tenés permisos para acceder a este recurso",
    });
  }

  next();
};

export default authMiddleware;