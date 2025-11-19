import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import routes from "./routes";

const app = express();

// ✅ Configure CORS correctly for your frontend and localhost
const allowedOrigins = [
  "https://fourwheelerbus.netlify.app", // your deployed frontend
  "http://localhost:3000", // your local React app
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());

// Chrome DevTools compatibility route (optional)
app.get("/.well-known/appspecific/com.chrome.devtools.json", (req, res) => {
  res.json({});
});

// ✅ Root endpoint - API information
app.get("/", (req, res) => {
  res.json({
    message: "Car Sale Backend API",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/health",
      api: "/api",
      auth: "/api/auth",
      expenses: "/api/expenses",
      customers: "/api/customers",
      inventory: "/api/inventory",
      transactions: "/api/transactions",
      vehicleOrders: "/api/vehicle-orders"
    },
    documentation: "API endpoints are prefixed with /api"
  });
});

// ✅ Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ✅ Prefix your routes under /api
app.use("/api", routes);

// ✅ 404 handler for undefined routes
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: "Route not found",
    path: req.path,
    method: req.method,
    message: "The requested endpoint does not exist on this server"
  });
});

// ✅ Global error handler (must be last)
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("Server error:", err);
  res.status(err.status || 500).json({ 
    error: err.message || "Server error",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;
