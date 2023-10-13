const net = require("net");
const fs = require('fs');
const directory = process.argv[2];

console.log("Logs from your program will appear here!");

const server = net.createServer((socket) => {
  let requestData = "";
  
  socket.on("data", (data) => {
    requestData += data.toString();
    // Check if the request is complete
    if (requestData.includes("\r\n\r\n")) {
      const request = requestData;
      const startLine = request.split("\r\n")[0];
      const [command, path] = startLine.split(" ");
      console.log(path);
  
      if (path === "/") {
        socket.write("HTTP/1.1 200 OK\r\n\r\n");
        socket.end();
      } else if (path.startsWith("/echo/")) {
        const randomString = path.substring(6);
        const response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${randomString.length}\r\n\r\n${randomString}`;
        socket.write(response);
        socket.end();
      } else if (path === "/user-agent") {
        const userAgent = request.split("\r\n").find(line => line.startsWith("User-Agent:")).split(": ")[1];
        const response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`;
        socket.write(response);
        socket.end();
      } else if (command === "POST" && path.startsWith("/files/")) {
        // Handle POST requests to save files
        const filename = path.substring(7);
        const fileStream = fs.createWriteStream(directory + "/" + filename);
  
        // Remove the request headers to only save the file content
        const fileContent = request.split("\r\n\r\n")[1];
        fileStream.write(fileContent);
        fileStream.end();
  
        // Respond with 201 Created
        const response = "HTTP/1.1 201 Created\r\n\r\n";
        socket.write(response);
        socket.end();
      } else if (path.startsWith("/files/")) {
        const requestedFile = path.substring(7);
        const filePath = directory + "/" + requestedFile;
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath);
          socket.write(`HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileContent.length}\r\n\r\n`);
          socket.write(fileContent);
          socket.end();
        } else {
          socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
          socket.end();
        }
      } else {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        socket.end();
      }
    }
  });

  socket.on("close", () => {
    console.log("socket closed");
  });
});

server.listen(4221, "localhost");
