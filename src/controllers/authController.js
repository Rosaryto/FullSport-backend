import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomInt, randomBytes, createHash } from "node:crypto";

import {
  enviarCodigoVerificacion,
  enviarCodigoRecuperacion,
} from "../config/mailer.js";

const generarCodigo = () => {
  return randomInt(100000, 1000000).toString();
};

// Registro de usuarios
export const registerUser = async (req, res) => {
  try {
    const { nombre, apellido, email, password } = req.body;

    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({
        mensaje: "Todos los campos son obligatorios",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        mensaje: "La contraseña debe tener al menos 8 caracteres",
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const usuarioExistente = await User.findOne({
      email: emailNormalizado,
    });

    if (usuarioExistente) {
      return res.status(400).json({
        mensaje: "Este correo electrónico ya está registrado",
      });
    }

    const passwordEncriptada = await bcrypt.hash(password, 10);
    const codigo = generarCodigo();

    const nuevoUsuario = new User({
      nombre,
      apellido,
      email: emailNormalizado,
      password: passwordEncriptada,
      rol: "cliente",
      emailVerificado: false,
      codigoVerificacion: codigo,
      codigoVerificacionExpira: new Date(Date.now() + 15 * 60 * 1000),
    });

    await nuevoUsuario.save();

    try {
      await enviarCodigoVerificacion(emailNormalizado, codigo);
    } catch (error) {
      await User.findByIdAndDelete(nuevoUsuario._id);

      return res.status(500).json({
        mensaje: "No se pudo enviar el correo de verificación",
      });
    }

    return res.status(201).json({
      mensaje:
        "Usuario registrado correctamente. Revisá tu correo para verificar tu cuenta.",
      usuario: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
        emailVerificado: nuevoUsuario.emailVerificado,
      },
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);

    return res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
};

// Verificación del correo electrónico
export const verifyEmail = async (req, res) => {
  try {
    const { email, codigo } = req.body;

    if (!email || !codigo) {
      return res.status(400).json({
        mensaje: "El correo electrónico y el código son obligatorios",
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const usuario = await User.findOne({
      email: emailNormalizado,
    });

    if (!usuario) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado",
      });
    }

    if (usuario.emailVerificado) {
      return res.status(400).json({
        mensaje: "Este correo electrónico ya está verificado",
      });
    }

    if (!usuario.codigoVerificacion) {
      return res.status(400).json({
        mensaje: "No hay un código de verificación activo",
      });
    }

    if (usuario.codigoVerificacionExpira < new Date()) {
      return res.status(400).json({
        mensaje: "El código de verificación ha expirado",
      });
    }

    if (usuario.codigoVerificacion !== codigo.toString().trim()) {
      return res.status(400).json({
        mensaje: "El código de verificación es incorrecto",
      });
    }

    usuario.emailVerificado = true;
    usuario.codigoVerificacion = null;
    usuario.codigoVerificacionExpira = null;

    await usuario.save();

    return res.status(200).json({
      mensaje: "Correo electrónico verificado correctamente",
    });
  } catch (error) {
    console.error("Error al verificar correo:", error);

    return res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
};

// Reenvío del código de verificación
export const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        mensaje: "El correo electrónico es obligatorio",
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const usuario = await User.findOne({
      email: emailNormalizado,
    });

    if (!usuario) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado",
      });
    }

    if (usuario.emailVerificado) {
      return res.status(400).json({
        mensaje: "Este correo electrónico ya está verificado",
      });
    }

    const codigo = generarCodigo();

    usuario.codigoVerificacion = codigo;
    usuario.codigoVerificacionExpira = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await usuario.save();

    try {
      await enviarCodigoVerificacion(emailNormalizado, codigo);
    } catch (error) {
      console.error("Error al reenviar código:", error);

      return res.status(500).json({
        mensaje: "No se pudo enviar el código de verificación",
      });
    }

    return res.status(200).json({
      mensaje: "Se envió un nuevo código de verificación a tu correo",
    });
  } catch (error) {
    console.error("Error al reenviar código:", error);

    return res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
};

// Inicio de sesión
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        mensaje: "El correo electrónico y la contraseña son obligatorios",
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const usuario = await User.findOne({
      email: emailNormalizado,
    });

    if (!usuario) {
      return res.status(401).json({
        mensaje: "Correo electrónico o contraseña incorrectos",
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        mensaje: "Esta cuenta se encuentra desactivada",
      });
    }

    const passwordCorrecta = await bcrypt.compare(
      password,
      usuario.password
    );

    if (!passwordCorrecta) {
      return res.status(401).json({
        mensaje: "Correo electrónico o contraseña incorrectos",
      });
    }

    if (!usuario.emailVerificado) {
      return res.status(403).json({
        mensaje:
          "Debés verificar tu correo electrónico antes de iniciar sesión",
        requiereVerificacion: true,
      });
    }

    const token = jwt.sign(
      {
        id: usuario._id,
        rol: usuario.rol,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    const recordarSesion = req.body.recordarSesion === true;

    const opcionesCookie = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    };

    if (recordarSesion) {
      opcionesCookie.maxAge = 24 * 60 * 60 * 1000;
    }

    res.cookie("token", token, opcionesCookie);

    return res.status(200).json({
      mensaje: "Inicio de sesión exitoso",
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        emailVerificado: usuario.emailVerificado,
      },
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);

    return res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
};

// Solicitud de recuperación de contraseña
export const requestPasswordRecovery = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        mensaje: "El correo electrónico es obligatorio",
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const usuario = await User.findOne({
      email: emailNormalizado,
    });

    if (!usuario || !usuario.emailVerificado || !usuario.activo) {
      return res.status(200).json({
        mensaje:
          "Si el correo pertenece a una cuenta habilitada, recibirás un código de recuperación.",
      });
    }

    const codigo = generarCodigo();

    usuario.codigoRecuperacion = await bcrypt.hash(codigo, 10);

    usuario.codigoRecuperacionExpira = new Date(
      Date.now() + 15 * 60 * 1000
    );

    usuario.tokenRecuperacion = null;
    usuario.tokenRecuperacionExpira = null;

    await usuario.save();

    try {
      await enviarCodigoRecuperacion(emailNormalizado, codigo);
    } catch (error) {
      usuario.codigoRecuperacion = null;
      usuario.codigoRecuperacionExpira = null;

      await usuario.save();

      console.error("Error al enviar código de recuperación:", error);

      return res.status(500).json({
        mensaje: "No se pudo enviar el correo de recuperación",
      });
    }

    return res.status(200).json({
      mensaje:
        "Si el correo pertenece a una cuenta habilitada, recibirás un código de recuperación.",
    });
  } catch (error) {
    console.error("Error al solicitar recuperación:", error);

    return res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
};

// Verificación del código de recuperación
export const verifyRecoveryCode = async (req, res) => {
  try {
    const { email, codigo } = req.body;

    if (!email || !codigo) {
      return res.status(400).json({
        mensaje: "El correo electrónico y el código son obligatorios",
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const usuario = await User.findOne({
      email: emailNormalizado,
    });

    if (!usuario || !usuario.codigoRecuperacion) {
      return res.status(400).json({
        mensaje: "El código de recuperación es inválido o ha expirado",
      });
    }

    if (
      !usuario.codigoRecuperacionExpira ||
      usuario.codigoRecuperacionExpira < new Date()
    ) {
      return res.status(400).json({
        mensaje: "El código de recuperación ha expirado",
      });
    }

    const codigoCorrecto = await bcrypt.compare(
      codigo.toString().trim(),
      usuario.codigoRecuperacion
    );

    if (!codigoCorrecto) {
      return res.status(400).json({
        mensaje: "El código de recuperación es incorrecto",
      });
    }

    const tokenRecuperacion = randomBytes(32).toString("hex");

    usuario.tokenRecuperacion = createHash("sha256")
      .update(tokenRecuperacion)
      .digest("hex");

    usuario.tokenRecuperacionExpira = new Date(
      Date.now() + 10 * 60 * 1000
    );

    usuario.codigoRecuperacion = null;
    usuario.codigoRecuperacionExpira = null;

    await usuario.save();

    return res.status(200).json({
      mensaje:
        "Código verificado correctamente. Ya podés restablecer tu contraseña.",
      tokenRecuperacion,
    });
  } catch (error) {
    console.error("Error al verificar código de recuperación:", error);

    return res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
};

// Restablecimiento de contraseña
export const resetPassword = async (req, res) => {
  try {
    const { email, tokenRecuperacion, nuevaPassword } = req.body;

    if (!email || !tokenRecuperacion || !nuevaPassword) {
      return res.status(400).json({
        mensaje: "Todos los campos son obligatorios",
      });
    }

    if (nuevaPassword.length < 8) {
      return res.status(400).json({
        mensaje: "La nueva contraseña debe tener al menos 8 caracteres",
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const usuario = await User.findOne({
      email: emailNormalizado,
    });

    if (!usuario || !usuario.tokenRecuperacion) {
      return res.status(400).json({
        mensaje: "El enlace de recuperación es inválido o ha expirado",
      });
    }

    if (
      !usuario.tokenRecuperacionExpira ||
      usuario.tokenRecuperacionExpira < new Date()
    ) {
      return res.status(400).json({
        mensaje: "El enlace de recuperación ha expirado",
      });
    }

    const tokenHash = createHash("sha256")
      .update(tokenRecuperacion)
      .digest("hex");

    if (tokenHash !== usuario.tokenRecuperacion) {
      return res.status(400).json({
        mensaje: "El token de recuperación es inválido",
      });
    }

    usuario.password = await bcrypt.hash(nuevaPassword, 10);

    usuario.codigoRecuperacion = null;
    usuario.codigoRecuperacionExpira = null;
    usuario.tokenRecuperacion = null;
    usuario.tokenRecuperacionExpira = null;

    await usuario.save();

    return res.status(200).json({
      mensaje:
        "Tu contraseña fue restablecida correctamente. Ya podés iniciar sesión.",
    });
  } catch (error) {
    console.error("Error al restablecer contraseña:", error);

    return res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
};

// Cierre de sesión
export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).json({
    mensaje: "Sesión cerrada correctamente",
  });
};

// Consulta de sesión
export const getSession = async (req, res) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(200).json({
        autenticado: false,
        usuario: null,
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(200).json({
        autenticado: false,
        usuario: null,
      });
    }

    const usuario = await User.findById(decoded.id).select(
      "nombre apellido email rol"
    );

    if (!usuario) {
      return res.status(200).json({
        autenticado: false,
        usuario: null,
      });
    }

    return res.status(200).json({
      autenticado: true,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error("Error al consultar sesión:", error);

    return res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
};