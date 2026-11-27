import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
    },

    apellido: {
      type: String,
      required: [true, "El apellido es obligatorio"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "El correo electrónico es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: 8,
    },

    // Rol y estado de la cuenta
    rol: {
      type: String,
      enum: ["admin", "cliente"],
      default: "cliente",
    },

    activo: {
      type: Boolean,
      default: true,
    },

    // Verificación del correo electrónico
    emailVerificado: {
      type: Boolean,
      default: false,
    },

    codigoVerificacion: {
      type: String,
      default: null,
    },

    codigoVerificacionExpira: {
      type: Date,
      default: null,
    },

    // Recuperación de contraseña
    codigoRecuperacion: {
      type: String,
      default: null,
    },

    codigoRecuperacionExpira: {
      type: Date,
      default: null,
    },

    tokenRecuperacion: {
      type: String,
      default: null,
    },

    tokenRecuperacionExpira: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;