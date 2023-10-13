const net = require("net");
const fs = require('fs');
1
const directory = process.argv[2];
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");
// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString();
    const dataArr= request.split("/r/n");
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
    else if(path.startsWith("/files") && command === "GET"){
      const directory = process.argv[3];
      // extract the filename
      const filename = path.split("/files/")[1];
      let response = "";
      // if the file exists
      if (fs.existsSync(`${directory}/${filename}`)) {
        response += "HTTP/1.1 200 OK\r\n";
        response += "Content-Type: application/octet-stream\r\n";
        // read the file contents
        const fileContent = fs.readFileSync(`${directory}/${filename}`, {
          encoding: "utf8",
          flag: "r",
        });
        // compute content length
        response += `Content-Length: ${fileContent.length}\r\n`;
        response += "\r\n";
        // send the file contents back to the client
        response += fileContent;
      } else {
        // if the file does not exist
        response += "HTTP/1.1 404 Not Found\r\n";
        response += "\r\n";
      }
      // send the response back to the client
      socket.write(response);
     }
     else if ( path.startsWith("/files") && command === "POST") {

      const directory = process.argv[3];
      // extract the filename
      const filename = path.split("/files/")[1];
      let response = "";
      // read the request body
      const requestBody = dataArr[dataArr.length - 1];
      console.log("writing to file..");
      try {
        // write the request body to the file
        fs.writeFileSync(`${directory}/${filename}`, requestBody);
        response += "HTTP/1.1 201 Created\r\n";
        response += "\r\n";
      } catch (err) {}
      // send the response back to the client
      socket.write(response);
     }
    else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }
    socket.end();
  });
  socket.on("close", () => {
   
    console.log("socket closed");
1
    });
});
//should work for multiple requests
server.listen(4221, "localhost");