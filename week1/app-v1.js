const http = require("http");

const PORT = process.env.PORT || 3001;
const HOST = "0.0.0.0";

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end(
    "Welcome to Pathnex - Shaping Careers | Docker Deployment on AWS EC2"
  );
});

server.listen(PORT, HOST, () => {
  console.log(`Pathnex server is running on http://${HOST}:${PORT}`);
});

