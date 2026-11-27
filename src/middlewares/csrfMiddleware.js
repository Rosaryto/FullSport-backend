// Métodos que no modifican datos
const METODOS_SEGUROS = new Set(["GET", "HEAD", "OPTIONS"]);

const normalizarOrigen = (valor) => {
  if (!valor) return null;

  try {
    return new URL(valor).origin;
  } catch {
    return null;
  }
};

// Protección CSRF mediante Origin y Referer
const csrfProtection = (origenesPermitidos = []) => {
  const permitidos = new Set(
    origenesPermitidos.map(normalizarOrigen).filter(Boolean)
  );

  const esProduccion = process.env.NODE_ENV === "production";

  const permiteSinOrigen =
    !esProduccion && process.env.CSRF_ALLOW_NO_ORIGIN === "true";

  return (req, res, next) => {
    if (METODOS_SEGUROS.has(req.method)) {
      return next();
    }

    const origin = normalizarOrigen(req.headers.origin);

    if (origin) {
      if (permitidos.has(origin)) {
        return next();
      }

      return res.status(403).json({
        mensaje: "Origen no permitido para esta solicitud",
      });
    }

    const referer = normalizarOrigen(req.headers.referer);

    if (referer) {
      if (permitidos.has(referer)) {
        return next();
      }

      return res.status(403).json({
        mensaje: "Origen no permitido para esta solicitud",
      });
    }

    if (permiteSinOrigen) {
      return next();
    }

    return res.status(403).json({
      mensaje:
        "Solicitud sin origen válido. Se requiere un Origin o Referer permitido.",
    });
  };
};

export default csrfProtection;