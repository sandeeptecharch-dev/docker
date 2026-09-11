const http = require("http");

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pathnex</title>

<style>
  body {
    margin: 0;
    height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, "San Francisco", Arial, sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at top, #1f4037, #0f2027);
    color: white;
    overflow: hidden;
  }

  .card {
    backdrop-filter: blur(25px);
    background: rgba(255, 255, 255, 0.07);
    border-radius: 24px;
    padding: 50px;
    max-width: 750px;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    animation: fadeIn 1.5s ease;
  }

  h1 {
    font-size: 2.8rem;
    margin-bottom: 10px;
  }

  p {
    font-size: 1.15rem;
    line-height: 1.7;
    opacity: 0.9;
  }

  .highlight {
    margin-top: 20px;
    font-weight: bold;
    font-size: 1.3rem;
    color: #00e6ff;
  }

  .motivation {
    margin-top: 25px;
    font-size: 1rem;
    color: #ddd;
    font-style: italic;
  }

  .cta {
    margin-top: 30px;
  }

  .btn {
    display: inline-block;
    padding: 14px 28px;
    border-radius: 30px;
    background: linear-gradient(45deg, #ff416c, #ff4b2b);
    color: white;
    text-decoration: none;
    font-weight: bold;
    transition: 0.3s;
    box-shadow: 0 5px 20px rgba(255,75,43,0.4);
  }

  .btn:hover {
    transform: scale(1.08);
    box-shadow: 0 10px 30px rgba(255,75,43,0.7);
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

</style>
</head>

<body>
  <div class="card">
    <h1>Hello All 👋</h1>

    <p>Welcome to <strong>Pathenx</strong>, A place for your Dream Job.</p>

    <p class="highlight">
      TUM MUJHE PADHAI KARKE DO, ME TUMJHE JOB DUNGA
    </p>

    <p>
      Visvas na ho to, Placement record check kar lo
    </p>

    <p>
      Agar apni aur apne maa baap ki kismat badlna chahte ho to 
      <strong>PADHO</strong> aur <strong> minimum 18+ LPA</strong> ki job lo 🚀
    </p>

    <p class="motivation">
      "Aaj mehnat karo, kal duniya tumse poochegi — kaise kiya?" 🔥
    </p>

    <p class="motivation">
      "Consistency + Skills = High Paying Job 💼"
    </p>

    <div class="cta">
      <a class="btn" href="https://www.youtube.com/@pathnex" target="_blank">
        🎥 Join Our YouTube Channel
      </a>
    </div>

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