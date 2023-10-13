const net = require("net");
const fs = require("fs");

// Define the directory where files will be stored
const directory = process.argv[3]; // Use process.argv[3] for the directory argument

// You can use print statements for debugging
console.log("Logs from your program will appear here!");

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString();
    const startLine = request.split("\r\n")[0];
    const [command, path, reqPath] = startLine.split(" ");
    console.log(path);

    if (command === "POST" && path.startsWith("/files/")) {
      // Handle POST requests to save files
      const filename = path.substring(7);
      const fileStream = fs.createWriteStream(directory + "/" + filename);
      const fileData = [];

      socket.on("data", (chunk) => {
        fileData.push(chunk);
      });

      socket.on("end", () => {
        const fileContent = Buffer.concat(fileData);
        fileStream.write(fileContent);
        fileStream.end();

        socket.write("HTTP/1.1 201 Created\r\n\r\n");
        socket.end();
      });
    } else if (path === "/") {
      // Handle root path
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (path.startsWith("/echo/")) {
      // Handle /echo/ paths
      const randomString = path.substring(6);
      const response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${randomString.length}\r\n\r\n${randomString}`;
      socket.write(response);
    } else if (path === "/user-agent") {
      // Handle /user-agent path
      const userAgent = request.split("\r\n").find((line) => line.startsWith("User-Agent:")).split(": ")[1];
      const response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`;
      socket.write(response);
    } else if (path.startsWith("/files/")) {
      // Handle GET requests for existing files
      const requestedFile = path.substring(7);
      const filePath = directory + "/" + requestedFile;
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath);
        socket.write(`HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileContent.length}\r\n\r\n${fileContent}\r\n`);
        socket.end();
      } else {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        socket.end();
      }
    } else {
      // Handle unknown paths
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }
  });

  socket.on("close", () => {
    console.log("socket closed");
  });
});

server.listen(4221, "localhost");
