import WAWebJS from "whatsapp-web.js";
import { SocketServer } from "./socket";
import {readdir} from "fs/promises";
import {existsSync, mkdirSync} from "fs";
import path from "path";
import {cwd} from "process";

export function PluginSystem(pluginsPath: string, createOnFallBack?: boolean) {
    if (!existsSync(pluginsPath) && !createOnFallBack) throw new Error("Plugins folder does not exist, please create it or set createOnFallBack to true")
    if (!existsSync(pluginsPath) && createOnFallBack) mkdirSync(pluginsPath)
    const plugins = new Map<string, Plugin>()
    const loadPlugins = async (wsServer?: ReturnType<typeof SocketServer>) => {
        const files = await readdir(pluginsPath)
        for (const file of files) {
            let plugin: any = undefined
            try {
                plugin = (await import(`${path.join(cwd(), pluginsPath, file)}`)).default()
                console.log(`Plugin ${plugin.name} v.${plugin.version} loaded!`)
            } catch(e) {
                console.log(`Plugin ${file} is not valid, skipping...`)
                console.log(e)
                if (wsServer) wsServer.server.emit("plugins:error",`Error loading ${file}`)
                continue
            }
            if (!plugin.name || !plugin.version || !plugin.description || !plugin.author || !plugin.onInit || !plugin.onDestroy || !plugin.onMessage) {
                console.log(`Plugin ${file} is not valid, skipping...`)
                if (wsServer) wsServer.server.emit("plugins:info",`Plugin ${file} is not valid, skipping...`)
                continue
            }
            plugins.set(plugin.name, plugin)
        }
    }

    const initPlugins = async (client: WAWebJS.Client, wsServer?: ReturnType<typeof SocketServer>) => {
        for (const plugin of plugins.values()) {
            try {
                await plugin.onInit(client, wsServer)
                if (wsServer) wsServer.server.emit("plugins:info",`Plugin ${plugin.name} loaded!`)
            } catch {
                if (wsServer) wsServer.server.emit("plugins:error",`Plugin ${plugin.name} failed to load!`)
            }
        }
    }

    const destroyPlugins = async (wsServer?: ReturnType<typeof SocketServer>) => {
        for (const plugin of plugins.values()) {
            try {
                await plugin.onDestroy()
                plugins.delete(plugin.name)
                if (wsServer) wsServer.server.emit("plugins:info",`Plugin ${plugin.name} unloaded!`)
            } catch {
                if (wsServer) wsServer.server.emit("plugins:error",`Plugin ${plugin.name} failed to unload!`)
            }
        }
    }

    const destroyPlugin = async (name: string, wsServer?: ReturnType<typeof SocketServer>) => {
        const plugin = plugins.get(name)
        if (!plugin) return
        try{
            await plugin.onDestroy()
        } catch {
            if (wsServer) wsServer.server.emit("plugins:error",`Plugin ${plugin.name} failed to unload!`)
        }
        plugins.delete(name)
    }

    const onMessage = async (message: WAWebJS.Message, client: WAWebJS.Client, wsServer?: ReturnType<typeof SocketServer>) => {
        for (const plugin of plugins.values()) {
            try {
                await plugin.onMessage(message, client, wsServer)
                if (wsServer) wsServer.server.emit("plugins:info",`Plugin ${plugin.name} executed!`)
            } catch (e) {
                console.log(e)
                if (wsServer) wsServer.server.emit("plugins:error",`Plugin ${plugin.name} failed to execute!`)
            }
        }
    }

    const reloadPlugins = async (client: WAWebJS.Client, wsServer?: ReturnType<typeof SocketServer>) => {
        await destroyPlugins(wsServer)
        await loadPlugins(wsServer)
        await initPlugins(client, wsServer)
    }

    return {
        loadPlugins,
        initPlugins,
        destroyPlugins,
        destroyPlugin,
        reloadPlugins,
        onMessage,
    }
}


export interface Plugin {
    name: string,
    version: string,
    description: string,
    author: string,
    onInit: (client: WAWebJS.Client, wsServer?: ReturnType<typeof SocketServer>) => Promise<void>,
    onDestroy: () => Promise<void>,
    onMessage: (message: WAWebJS.Message, client: WAWebJS.Client, wsServer?: ReturnType<typeof SocketServer>) => Promise<void>,
}