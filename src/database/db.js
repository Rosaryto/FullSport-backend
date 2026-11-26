import mongoose from "mongoose";

const conectarBD = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.info("Base de datos conectada");
  } catch (error) {
    console.error(error);
  }
};

conectarBD();
