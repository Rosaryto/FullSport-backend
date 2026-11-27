import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import "../database/db.js";
import csrfProtection from "../middlewares/csrfMiddleware.js";

export default class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.middlewares();
  }

  middlewares() {
    this.app.use(
      cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
      }),
    );

    this.app.use(morgan("dev"));
    this.app.use(express.json());
    this.app.use(cookieParser());

 const origenesPermitidos = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  ...(process.env.CSRF_ALLOWED_ORIGINS
    ? process.env.CSRF_ALLOWED_ORIGINS.split(",")
    : []),
];

this.app.use("/api", csrfProtection(origenesPermitidos));

    const __dirname = dirname(fileURLToPath(import.meta.url));
    this.app.use(express.static(__dirname + "/../../public"));
  }

  listen() {
    this.app.listen(this.port, () => {
      console.info(
        `El servidor se está ejecutando en http://localhost:${this.port}`,
      );
    });
  }
}
