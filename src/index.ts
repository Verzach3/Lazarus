// Aqui no pongas nada de logica, usalo pa inicializar el servidor o algo asi XD
import { PluginSystem } from "./plugins";
import { SimpleClient } from "./simpleClient";
import { SocketServer } from "./socket";
import unpackPlugins from "./util/unpackPlugins";

async function startLazarus() {

  const client = SimpleClient();
  client.initialize();
  const socket = SocketServer();
  await unpackPlugins()
  const plugins = PluginSystem("./plugins", true);
  client.on("ready", async () => {
    console.log("Client is ready!");
    await plugins.loadPlugins(socket);
    await plugins.initPlugins(client, socket);
  })
  client.on("message", async (message) => {
    await plugins.onMessage(message, client, socket);
  })

}

startLazarus()
