import EventEmitter from "events"
import { Server } from "socket.io"
import { WebSocketServer, WebSocket } from "ws"

function SocketServer(ev: EventEmitter) {
    const wss = new Server(8080);
    wss.on("connection", (ws) => {
        ws.on("message", (message) => {
            console.log(`Received message => ${message}`)
        })
        ws.on("plugins:reload", () => {
            ev.emit("plugins:reload")
        })
        ws.send("Hello! Message From Server!!")
    })

    wss.on("plugins:reload", () => {
        console.log("Reloading plugins...");
    })
    return {
        server: wss,
    };
}

export { SocketServer };