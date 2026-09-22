const http = require("http");

let items = ["Apple", "Banana"];

const server = http.createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");
    if (req.method === "GET") {
        res.end(JSON.stringify(items));
    }
    else if (req.method === "POST") {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", () => {
            // const newItem = JSON.parse(body);
            items.push(newItem);
            res.end("Item added: " + body);
        });
    }
});

server.listen(4000, () => {
    console.log("Server running on port 4000");
});