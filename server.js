const express = require("express");
const path = require("path");
const http = require("http");
const { setupWebSocket } = require("./routes/ws");
const userRoutes = require("./routes/user");

const app = express();
const port = process.env.PORT || 3100;

// Body parsing
app.use(express.json());

// Static files - public dir (main app)
app.use(
  express.static(path.join(__dirname, "public"), {
    setHeaders: (res, filePath) => {
      const name = path.basename(filePath);
      if (name === "chunk.vendor.js" || name === "designer.browser.js") {
        res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
      }
    },
  }),
);

// Static files - docs
app.use("/docs", express.static(path.join(__dirname, "docs")));

// API routes
app.get("/connection/test", (_req, res) => res.send("OK"));
app.use(userRoutes);

// Maintenance status
app.get("/maintenance/status", (_req, res) => {
  res.json({ maintenance: false });
});

// i18n URL
app.get("/i18n-url/:locale/designer", (_req, res) => {
  res.json({});
});

// License check (GET)
app.get("/license", (_req, res) => {
  res.json({
    plan: "pro",
    status: "active",
    expireDate: "2099-12-31T23:59:59.000Z",
    features: [],
  });
});

// Subscription test
app.get("/subscription/test", (_req, res) => {
  res.json({ active: true, plan: "pro" });
});

// File listing
app.get("/file", (_req, res) => {
  res.json([]);
});

// Catch /null requests (client bug sends null URL)
app.get("/null", (_req, res) => {
  res.json({});
});

// Request logger (after static, so only API hits are logged)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// HTTP + WebSocket server
const server = http.createServer(app);
setupWebSocket(server);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
