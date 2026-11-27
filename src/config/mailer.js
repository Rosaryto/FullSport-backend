import nodemailer from "nodemailer";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const logoPath = join(
  __dirname,
  "../../public/img/fullsport-logo-email.png"
);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const colores = {
  negro: "#0B0B0C",
  lima: "#D4FF3A",
  hueso: "#F4F4F1",
  coral: "#FF5A36",
  gris: "#A1A1A6",
  blanco: "#FFFFFF",
};

// Plantilla general de los correos
const plantillaCorreo = (titulo, contenido) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FULL SPORT</title>
</head>

<body style="
  margin: 0;
  padding: 25px 10px;
  background-color: ${colores.hueso};
  font-family: Arial, Helvetica, sans-serif;
  color: ${colores.negro};
">

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    role="presentation"
    style="background-color: ${colores.hueso};"
  >
    <tr>
      <td align="center">

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          role="presentation"
          style="
            max-width: 560px;
            background-color: ${colores.blanco};
          "
        >

          <!-- Encabezado -->
          <tr>
            <td
              align="center"
              style="
                background-color: ${colores.negro};
                padding: 30px 20px;
              "
            >
              <img
                src="cid:fullsportlogo"
                alt="FULL SPORT"
                width="220"
                style="
                  display: block;
                  width: 220px;
                  max-width: 100%;
                  height: auto;
                  border: 0;
                "
              >
            </td>
          </tr>

          <!-- Contenido -->
          <tr>
            <td
              style="
                padding: 35px 30px;
                background-color: ${colores.blanco};
              "
            >

              <p style="
                margin: 0 0 12px;
                color: ${colores.coral};
                font-size: 11px;
                font-weight: bold;
                letter-spacing: 2px;
              ">
                FULL SPORT · TU TIENDA DEPORTIVA
              </p>

              <h1 style="
                margin: 0 0 22px;
                color: ${colores.negro};
                font-family: Impact, 'Arial Narrow', Arial, sans-serif;
                font-size: 30px;
                line-height: 1.15;
                font-weight: bold;
                text-transform: uppercase;
              ">
                ${titulo}
              </h1>

              ${contenido}

            </td>
          </tr>

          <!-- Pie de página -->
          <tr>
            <td
              align="center"
              style="
                padding: 25px 20px;
                background-color: ${colores.negro};
              "
            >

              <p style="
                margin: 0;
                color: ${colores.blanco};
                font-size: 13px;
                font-weight: bold;
                letter-spacing: 1px;
              ">
                FULL SPORT
              </p>

              <p style="
                margin: 8px 0 0;
                color: ${colores.gris};
                font-size: 12px;
                line-height: 1.6;
              ">
                Tu tienda online deportiva.
              </p>

              <p style="
                margin: 14px 0 0;
                color: ${colores.lima};
                font-size: 10px;
                font-weight: bold;
                letter-spacing: 2px;
              ">
                SUPERÁ TUS LÍMITES
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;

// Bloque visual para mostrar el código de seguridad
const bloqueCodigo = (codigo) => `
  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    role="presentation"
    style="
      margin: 25px 0;
      background-color: ${colores.negro};
      border-bottom: 4px solid ${colores.lima};
    "
  >
    <tr>
      <td
        align="center"
        style="padding: 24px 10px;"
      >

        <p style="
          margin: 0 0 12px;
          color: ${colores.gris};
          font-size: 11px;
          font-weight: bold;
          letter-spacing: 2px;
        ">
          TU CÓDIGO DE SEGURIDAD
        </p>

        <p style="
          margin: 0;
          color: ${colores.lima};
          font-family: 'Courier New', monospace;
          font-size: 34px;
          font-weight: bold;
          letter-spacing: 7px;
        ">
          ${codigo}
        </p>

      </td>
    </tr>
  </table>
`;

// Imagen del logo incrustada en el correo
const adjuntoLogo = {
  filename: "fullsport-logo-email.png",
  path: logoPath,
  cid: "fullsportlogo",
};

// Comprueba la conexión con Mailtrap
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
    const contenido = `
      <p style="
        margin: 0 0 15px;
        font-size: 15px;
        line-height: 1.7;
      ">
        ¡Te damos la bienvenida a <strong>FULL SPORT</strong>!
      </p>

      <p style="
        margin: 0 0 15px;
        color: ${colores.gris};
        font-size: 15px;
        line-height: 1.7;
      ">
        Gracias por registrarte. Para activar tu cuenta,
        ingresá el siguiente código de verificación:
      </p>

      ${bloqueCodigo(codigo)}

      <p style="
        margin: 0 0 15px;
        color: ${colores.gris};
        font-size: 13px;
        line-height: 1.7;
      ">
        Este código tiene una validez de
        <strong style="color: ${colores.negro};">
          15 minutos
        </strong>.
      </p>

      <p style="
        margin: 0;
        color: ${colores.negro};
        font-size: 13px;
        line-height: 1.7;
      ">
        Si no solicitaste este registro, podés ignorar este correo.
      </p>
    `;

    const resultado = await transporter.sendMail({
      from: '"FULL SPORT" <no-reply@fullsport.com>',
      to: email,
      subject: "Verificá tu cuenta | FULL SPORT",
      html: plantillaCorreo("¡Bienvenido a FULL SPORT!", contenido),
      attachments: [adjuntoLogo],
    });

    console.log("Correo de verificación enviado:", resultado.messageId);
    console.log("PLANTILLA NUEVA FULL SPORT");

    return resultado;

  } catch (error) {
    console.error("Error al enviar el correo:", error.message);
    throw error;
  }
};

// Envía el código para recuperar la contraseña
export const enviarCodigoRecuperacion = async (email, codigo) => {
  try {
    const contenido = `
      <p style="
        margin: 0 0 15px;
        font-size: 15px;
        line-height: 1.7;
      ">
        Recibimos una solicitud para restablecer tu contraseña.
      </p>

      <p style="
        margin: 0 0 15px;
        color: ${colores.gris};
        font-size: 15px;
        line-height: 1.7;
      ">
        Utilizá el siguiente código para continuar con el proceso:
      </p>

      ${bloqueCodigo(codigo)}

      <p style="
        margin: 0 0 15px;
        color: ${colores.gris};
        font-size: 13px;
        line-height: 1.7;
      ">
        Este código tiene una validez de
        <strong style="color: ${colores.negro};">
          15 minutos
        </strong>.
      </p>

      <p style="
        margin: 0;
        color: ${colores.negro};
        font-size: 13px;
        line-height: 1.7;
      ">
        Si no solicitaste recuperar tu contraseña,
        podés ignorar este correo.
      </p>
    `;

    const resultado = await transporter.sendMail({
      from: '"FULL SPORT" <no-reply@fullsport.com>',
      to: email,
      subject: "Recuperación de contraseña | FULL SPORT",
      html: plantillaCorreo("Recuperá tu contraseña", contenido),
      attachments: [adjuntoLogo],
    });

    console.log("Correo de recuperación enviado:", resultado.messageId);
    console.log("PLANTILLA NUEVA FULL SPORT");

    return resultado;

  } catch (error) {
    console.error(
      "Error al enviar el correo de recuperación:",
      error.message
    );

    throw error;
  }
};

export default transporter;
