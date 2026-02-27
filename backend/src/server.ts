import app from "./app";
import dotenv from "dotenv";
import { initAdmin } from "./utils/initAdmin";

dotenv.config();

const PORT = process.env.PORT
  ? Number(process.env.PORT)
  : 5000;

/* ======================================================
   START SERVER
====================================================== */
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);

  try {
    await initAdmin();
    console.log("✅ Admin check completed");
  } catch (err) {
    console.error("❌ Admin init failed:", err);
  }
});
