import app from "./app";
import dotenv from "dotenv";
import path from "path";
import { initAdmin } from "./utils/initAdmin";
import express from "express";

dotenv.config();

const PORT = process.env.PORT
  ? Number(process.env.PORT)
  : 5000;

/* ================================
   STATIC FILES (VERY IMPORTANT)
================================ */
app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "../uploads")
  )
);


/* ================================
   START SERVER
================================ */

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);

  // ✅ run admin init AFTER server boots
  try {
    await initAdmin();
    console.log("✅ Admin check completed");
  } catch (err) {
    console.error("❌ Admin init failed:", err);
  }
});
