// Aqui no pongas nada de logica, usalo pa inicializar el servidor o algo asi XD
import { PluginSystem } from "./plugins";
import { SocketServer } from "./socket";
const socket = SocketServer();
const plugins = PluginSystem("./plugins", true);
plugins.loadPlugins(socket).then( _ => {
    console.log("Plugins loaded!");
});
