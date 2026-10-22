

const http = require("http");
const fs = require("fs");
const path = require("path");

const server = http.createServer((req, res) => {
  const file = path.join(__dirname, "public", "index.html");

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end("Create public/index.html first");
    }

    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8"
    });
    res.end(data);
  });
});

server.listen(process.env.PORT || 3000, "0.0.0.0", () => {
  console.log("Number Duel server is running");
});
