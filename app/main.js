const net = require("net");
const fs = require("fs");
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");
// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  // accept tcp connection
  socket.on("data", (data) => {
    // extract data from the buffer
    const dataString = data.toString();
    // extract all data by separating by new line
    const dataArr = dataString.split("\r\n");
    // extract the first line
    const firstLine = dataArr[0];
    // extract the method
    const method = firstLine.split(" ")[0];
    // extract the path
    const path = firstLine.split(" ")[1];
    // if the path is / then return 200 OK
    if (path === "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    }
    // if path starts with /echo/
    else if (path.startsWith("/echo/")) {
      // the path will have the following format: /echo/<message>
      // extract everything after /echo/
      const message = path.split("/echo/")[1];
      // send the message back to the client
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${message.length}\r\n\r\n${message}\r\n\r`
      );
    }
    // if the path starts with /user-agent
    else if (path.startsWith("/user-agent")) {
      // extract the user agent
      const userAgent = dataArr[2].split(" ")[1];
      let response = "";
      response += "HTTP/1.1 200 OK\r\n";
      response += "Content-Type: text/plain\r\n";
      response += `Content-Length: ${userAgent.length}\r\n`;
      response += "\r\n";
      response += `${userAgent}`;
      // send the user agent back to the client
      socket.write(response);
    }
    // if the path starts with /files
    else if (path.startsWith("/files") && method === "GET") {
      // extract directory from shell paramters
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
    // if the path starts with /files and the method is POST
    else if (path.startsWith("/files") && method === "POST") {
      // extract directory from shell paramters
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
1
    }
    // else return 404 Not Found
    else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }
    socket.end();
  });
  socket.on("close", () => {
    socket.end();
    server.close();
  });
});
server.listen(4221, "localhost");