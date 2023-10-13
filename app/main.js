const net = require("net");
const fs = require('fs');
const directory = process.argv[2];

console.log("Logs from your program will appear here!");

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString();
    const startLine = request.split("\r\n")[0];
    const [command, path, reqPath] = startLine.split(" ");
    
    if (command === "GET") {
      if (path === "/") {
        socket.write("HTTP/1.1 200 OK\r\n\r\n");
      } else if (path.startsWith("/echo/")) {
        const randomString = path.substring(6);
        const response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${randomString.length}\r\n\r\n${randomString}`;
        socket.write(response);
      } else if(path === "/user-agent"){
        const userAgent = request.split("\r\n").find(line => line.startsWith("User-Agent:")).split(": ")[1];      
        const response= `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`;
        socket.write(response);
      } else if(path.startsWith("/files/")){
        let directory = process.argv[3];
        let file = data.toString().slice(data.toString().indexOf("/") + 7, data.toString().indexOf(" HTTP"))
        if (fs.existsSync(directory+file)) {
          let fileContent = fs.readFileSync(directory + file)
          socket.write(`HTTP/1.1 200 OK\r\n`)
          socket.write(`Content-Type: application/octet-stream\r\n`)
          socket.write(`Content-Length: ${fileContent.length}\r\n\r\n`)
          socket.write(`${fileContent}\r\n`)
          socket.end()
        } else {
          socket.write("HTTP/1.1 404 Not Found\r\n\r\n")
          socket.end()
        }
      } else {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      }
    } else if (command === "POST" && path.startsWith("/files/")) {
      let filename = path.substring(7);
      let filepath = directory + filename;
      let fileData = reqPath.split("\r\n\r\n")[1];
      
      fs.writeFile(filepath, fileData, (err) => {
        if (err) {
          console.log(err);
          socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
        } else {
          socket.write("HTTP/1.1 201 Created\r\n\r\n");
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
