import express from "express";
import cors from "cors";
import path from "path";
import routes from "./routes";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000", // 👈 frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

app.use("/api", routes);

export default app;
