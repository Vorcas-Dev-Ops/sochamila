console.log("[APP] Starting app initialization...");

import express from "express";
import cors from "cors";
import path from "path";
import routes from "./routes";
import {
  requestIdMiddleware,
  httpLogger,
  performanceWarning,
} from "./middlewares/logger";
import {
  globalErrorHandler,
  notFoundHandler,
} from "./middlewares/errorHandler";

const app = express();

/* ================================
   REQUEST TRACKING
================================ */
app.use(requestIdMiddleware);
app.use(httpLogger);
app.use(performanceWarning(1000)); // Warn if request takes > 1 second

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
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ================================
   STATIC FILES
================================ */
const uploadsPath = path.join(__dirname, "../uploads");
console.log("[APP] Serving static files from:", uploadsPath);
console.log("[APP] Uploads folder exists:", require("fs").existsSync(uploadsPath));

// TEST ROUTE
app.get("/test-static", (req, res) => {
  res.json({ message: "test endpoint works" });
});

app.use("/uploads", express.static(uploadsPath, { 
  dotfiles: "allow",
  cacheControl: false,  
}));

/* ================================
   API ROUTES
================================ */
app.use("/api", routes);

/* ================================
   ERROR HANDLING (MUST BE LAST)
================================ */
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
