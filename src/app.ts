import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import routes from "./routes";

const app = express();

// ✅ Configure CORS correctly for your frontend and localhost
app.use(
  cors({
    origin: [
      "https://fourwheelerbus.netlify.app", // your deployed frontend
      "http://localhost:3000", // your local React app
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());

// ✅ Add safe and consistent headers for all responses
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Chrome DevTools compatibility route (optional)
app.get("/.well-known/appspecific/com.chrome.devtools.json", (req, res) => {
  res.json({});
});

// ✅ Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ✅ Prefix your routes under /api
app.use("/api", routes);

// ✅ Global error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

export default app;
