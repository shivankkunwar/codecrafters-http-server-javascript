const net = require("net");
const fs = require('fs');
const directory = process.argv[2];
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString();

    const startLine = request.split("\r\n")[0];
    const [method, path, reqPath] = startLine.split(" ");

    if (method === "POST" && path.startsWith("/files/")) {
      const filename = path.substring(7);
      const filepath = `./${directory}/${filename}`;

      socket.on("data", (data) => {
        requestBody += data.toString();
      });

      socket.on("end", () => {
        try {
          fs.writeFileSync(filepath, requestBody);
          socket.write("HTTP/1.1 201 Created\r\n\r\n");
        } catch (err) {
          socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
        }
        socket.end();
      });
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.end();
    }
  });

  socket.on("close", () => {
    console.log("socket closed");
    });
});
//should work for multiple requests
server.listen(4221, "localhost");
