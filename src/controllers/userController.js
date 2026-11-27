import User from "../models/User.js";

// Obtener perfil del usuario autenticado
export const getUserProfile = async (req, res) => {
  try {
    const usuario = await User.findById(req.userId).select("-password");

    if (!usuario) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      mensaje: "Perfil obtenido correctamente",
      usuario,
    });

  } catch (error) {
    console.error("Error al obtener perfil:", error);

    return res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
};