import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verifica la conexión con el servidor de correo
export const verificarConexionCorreo = async () => {
  try {
    await transporter.verify();
    console.log("Conexión con Mailtrap establecida correctamente");
  } catch (error) {
    console.error("Error de conexión con Mailtrap:", error.message);
  }
};

// Envía el código de verificación del registro
export const enviarCodigoVerificacion = async (email, codigo) => {
  try {
    const resultado = await transporter.sendMail({
      from: '"FULL SPORT" <no-reply@fullsport.com>',
      to: email,
      subject: "Código de verificación de FULL SPORT",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>¡Bienvenido a FULL SPORT!</h2>

          <p>Gracias por registrarte en nuestra plataforma.</p>
          <p>Tu código de verificación es:</p>

          <h1 style="
            letter-spacing: 8px;
            color: #16a34a;
            font-size: 32px;
          ">
            ${codigo}
          </h1>

          <p>Este código tiene una validez de 15 minutos.</p>

          <p>
            Si no solicitaste este registro,
            podés ignorar este correo.
          </p>

          <hr />

          <p style="color: #888;">
            FULL SPORT - Tu tienda online deportiva.
          </p>
        </div>
      `,
    });

    console.log("Correo de verificación enviado:", resultado.messageId);

    return resultado;
  } catch (error) {
    console.error("Error al enviar el correo:", error.message);
    throw error;
  }
};

// Envía el código para recuperar la contraseña
export const enviarCodigoRecuperacion = async (email, codigo) => {
  try {
    const resultado = await transporter.sendMail({
      from: '"FULL SPORT" <no-reply@fullsport.com>',
      to: email,
      subject: "Recuperación de contraseña - FULL SPORT",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Recuperación de contraseña</h2>

          <p>Recibimos una solicitud para restablecer tu contraseña.</p>
          <p>Tu código de recuperación es:</p>

          <h1 style="
            letter-spacing: 8px;
            color: #16a34a;
            font-size: 32px;
          ">
            ${codigo}
          </h1>

          <p>Este código tiene una validez de 15 minutos.</p>

          <p>
            Si no solicitaste recuperar tu contraseña,
            podés ignorar este correo.
          </p>

          <hr />

          <p style="color: #888;">
            FULL SPORT - Tu tienda online deportiva.
          </p>
        </div>
      `,
    });

    console.log("Correo de recuperación enviado:", resultado.messageId);

    return resultado;
  } catch (error) {
    console.error("Error al enviar el correo de recuperación:", error.message);
    throw error;
  }
};
export default transporter;
