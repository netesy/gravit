const WebSocket = require("ws");

function setupWebSocket(server) {
  const wss = new WebSocket.Server({
    server,
    path: "/license/license",
    verifyClient: (_info, done) => done(true),
  });

  wss.on("connection", (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const lang = url.searchParams.get("lang");
    console.log(`WS connected (lang=${lang})`);

    ws.on("message", (message) => {
      try {
        const parsed = JSON.parse(message.toString());
        if (parsed.name === "ping") {
          ws.send(JSON.stringify({ name: "pong" }));
        }
      } catch {
        // ignore malformed messages
      }
    });

    ws.on("close", () => console.log("WS disconnected"));
  });

  return wss;
}

module.exports = { setupWebSocket };
