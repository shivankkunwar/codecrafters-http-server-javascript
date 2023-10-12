const net = require("net");
const fs = require('fs');
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString();
  
    const startLine = request.split("\r\n")[0];
    const[command, path, reqPath]  = startLine.split(" ");
    console.log(path);
    if (path === "/") {
        socket.write("HTTP/1.1 200 OK\r\n\r\n");
      }
    else if (path.startsWith("/echo/")) {
      const randomString = path.substring(6);
      const response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${randomString.length}\r\n\r\n${randomString}`;
      socket.write(response);
    } 
    else if(path === "/user-agent"){
        const userAgent = request.split("\r\n").find(line => line.startsWith("User-Agent:")).split(": ")[1];      
        const response= `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`;
        socket.write(response);
    }
    else if(path.startsWith("/files/")){
        const filename = path.substring(7);
        const filepath= `./${directory}/${filename}`;

        fs.readFile(filepath, (err, data) => {
          if(err){
            socket.write("HTTP/1.1 404 Not Found\r\n\r\n");

          }
          else{
            const response = `HTTTP/1.1 200 OK\r\nContent-Type: ${data.length}\r\n\r\n${data}`;

            socket.write(response);
          }
         
        });
        return ; // Return here to prevent socket.end() from being called before the file is read
    }
    else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");

    }
    socket.end();
  });

  socket.on("close", () => {
    console.log("socket closed");
    });
});
//should work for multiple requests
server.listen(4221, "localhost");
