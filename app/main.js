const net = require("net");

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
        const [extra, value]= request.split("\r\n")[2].split(" ");
      
        const response= `${reqPath} 200 OK \r\n\r\nContent-Type: text/plain\r\nContent-Length: ${value.length}\r\n\r\n${value}`;
        socket.write(response);
    }
    else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }
    socket.end();
  });

  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");
