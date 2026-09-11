const http = require("http");

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pathenx Aug</title>

<style>
  body {
    margin: 0;
    height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, "San Francisco", Arial, sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0f2027, #2c5364);
    color: white;
  }

  .card {
    backdrop-filter: blur(20px);
    background: rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 40px;
    max-width: 700px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  }

  h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
  }

  p {
    font-size: 1.1rem;
    line-height: 1.6;
    opacity: 0.9;
  }

  .highlight {
    margin-top: 20px;
    font-weight: bold;
    font-size: 1.2rem;
    color: #00e6ff;
  }

</style>
</head>

<body>
  <div class="card">
    <h1>Hello All 👋</h1>
    <p>Welcome to <strong>Pathnex</strong>, A place for your Dream Job.</p>

    <p class="highlight">
      TUM MUJHE PADHAI KARKE DO, ME TUMHE JOB DUNGA
    </p>

    <p>
      Visvas na ho to, Placement record check kar lo
    </p>

    <p>
      Agar apni aur apne maa baap ki kismat badlna chahte ho to 
      <strong>PADHO</strong> aur <strong>18+ LPA</strong> ki job lo 🚀
    </p>
  </div>
</body>
</html>
`;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(html);
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
