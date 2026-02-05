import express from "express";
import cors from "cors";
import path from "path";
import routes from "./routes";

const app = express();

/* ================================
   CORS
================================ */
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ================================
   BODY PARSERS
================================ */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================================
   STATIC FILES (FIXED ✅)
================================ */
app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "../uploads")
  )
);


/* ================================
   API ROUTES
================================ */
app.use("/api", routes);

export default app;
