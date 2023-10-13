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
    const dataArr= data.split("/r/n");
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
      let directory = process.argv[3];
			let file = data.toString().slice(data.toString().indexOf("/") + 7, data.toString().indexOf(" HTTP"))
			if (fs.existsSync(directory+file)) {
				let fileContent = fs.readFileSync(directory + file)
				socket.write(`HTTP/1.1 200 OK\r\n`)
				socket.write(`Content-Type: application/octet-stream\r\n`)
				socket.write(`Content-Length: ${fileContent.length}\r\n\r\n`)
				socket.write(`${fileContent}\r\n`)
				socket.end()
			}
			else {
				socket.write("HTTP/1.1 404 Not Found\r\n\r\n")
				socket.end()
1
1
			}
     }
     else if ( path.startsWith("/files") && method === "POST") {

        const directory = process.argv[3];
        const filename = path.split("/files/")[1];

        let response = "";

        const requestBody = dataArr[dataArr.length -1];

        console.log("writing to file.. ");

        try{
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