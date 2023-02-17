import { WebSocketServer } from "ws"

function SocketServer() {
    const wss = new WebSocketServer({ port: 8080 })
    wss.on("connection", (ws) => {
        ws.on("message", (message) => {
            console.log(`Received message => ${message}`)
        })
        ws.send("Hello! Message From Server!!")
    })
}

export default { SocketServer };