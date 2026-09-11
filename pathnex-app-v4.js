const http = require("http");

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pathnex</title>

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, "San Francisco", Arial;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0f2027;
    color: white;
    overflow: hidden;
  }

  /* Animated Gradient Background */
  body::before {
    content: "";
    position: absolute;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, #00c6ff, #0072ff, #ff416c, #ff4b2b);
    animation: gradientMove 10s infinite linear;
    z-index: -2;
    opacity: 0.2;
  }

  @keyframes gradientMove {
    0% { transform: translate(0,0); }
    50% { transform: translate(-25%, -25%); }
    100% { transform: translate(0,0); }
  }

  /* Glow blobs */
  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.5;
    z-index: -1;
  }

  .blob1 { width: 300px; height: 300px; background: #00e6ff; top: 10%; left: 10%; }
  .blob2 { width: 300px; height: 300px; background: #ff416c; bottom: 10%; right: 10%; }

  .card {
    backdrop-filter: blur(30px);
    background: rgba(255,255,255,0.08);
    border-radius: 25px;
    padding: 50px;
    max-width: 800px;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    animation: fadeIn 1.5s ease;
  }

  h1 {
    font-size: 3rem;
    margin-bottom: 10px;
  }

  .typing {
    color: #00e6ff;
    font-weight: bold;
    font-size: 1.4rem;
    height: 30px;
    margin-bottom: 20px;
  }

  p {
    font-size: 1.1rem;
    line-height: 1.6;
    opacity: 0.9;
  }

  .highlight {
    margin-top: 20px;
    font-size: 1.3rem;
    font-weight: bold;
    color: #00e6ff;
  }

  .stats {
    display: flex;
    justify-content: space-around;
    margin-top: 30px;
  }

  .stat h2 {
    font-size: 2rem;
    color: #00e6ff;
  }

  .stat p {
    font-size: 0.9rem;
  }

  .btn {
    margin-top: 30px;
    display: inline-block;
    padding: 14px 30px;
    border-radius: 30px;
    background: linear-gradient(45deg, #ff416c, #ff4b2b);
    color: white;
    text-decoration: none;
    font-weight: bold;
    transition: 0.3s;
    box-shadow: 0 5px 20px rgba(255,75,43,0.5);
  }

  .btn:hover {
    transform: scale(1.1);
  }

  .motivation {
    margin-top: 20px;
    font-style: italic;
    color: #ccc;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }

</style>
</head>

<body>

<div class="blob blob1"></div>
<div class="blob blob2"></div>

<div class="card">

  <h1>Hello All 👋</h1>

  <div class="typing" id="typing"></div>

  <p>Welcome to <strong>Pathnex - Shaping Careers</strong>, A place for your Dream Job.</p>

  <p class="highlight">
    TUM MUJHE PADHAI KARKE DO, ME TUMJHE JOB DUNGA
  </p>

  <p>
    Visvas na ho to, Placement record check kar lo
  </p>

  <p>
    Agar apni aur apne maa baap ki kismat badlna chahte ho to 
    <strong>PADHO</strong> aur <strong>minimum 18+ LPA</strong> ki job lo 🚀
  </p>

  <!-- Stats Section -->
  <div class="stats">
    <div class="stat">
      <h2>500+</h2>
      <p>Students Placed</p>
    </div>
    <div class="stat">
      <h2>18+ LPA</h2>
      <p>Minimum Package</p>
    </div>
    <div class="stat">
      <h2>100%</h2>
      <p>Dedication</p>
    </div>
  </div>

  <p class="motivation">
    "Aaj padhoge toh kal kamaoge 💰"
  </p>

  <p class="motivation">
    "Skill bana lo, job khud peeche aayegi 🔥"
  </p>

  <a class="btn" href="https://www.youtube.com/@pathnex" target="_blank">
    🎥 Join YouTube Channel
  </a>

</div>

<script>
  const texts = [
    "Learn Skills 🚀",
    "Crack High Paying Jobs 💼",
    "Build Your Future 🔥",
    "Become Job Ready 💯"
  ];

  let i = 0;
  let j = 0;
  let currentText = "";
  let isDeleting = false;

  function type() {
    currentText = texts[i];
    
    if (!isDeleting) {
      document.getElementById("typing").innerHTML = currentText.substring(0, j++);
      if (j > currentText.length) {
        isDeleting = true;
        setTimeout(type, 1000);
        return;
      }
    } else {
      document.getElementById("typing").innerHTML = currentText.substring(0, j--);
      if (j === 0) {
        isDeleting = false;
        i = (i + 1) % texts.length;
      }
    }

    setTimeout(type, isDeleting ? 50 : 100);
  }

  type();
</script>

</body>
</html>
`;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(html);
});

server.listen(3000);