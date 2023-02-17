import { WebSocketServer, WebSocket } from "ws"

function SocketServer() {
    const wss = new WebSocketServer({ port: 8080 })
    wss.on("connection", (ws) => {
        ws.on("message", (message) => {
            console.log(`Received message => ${message}`)
        })
        ws.send("Hello! Message From Server!!")
    })

    const broadcast = (data: any) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }
    return {
        server: wss,
        broadcast,

    };
}

export { SocketServer };