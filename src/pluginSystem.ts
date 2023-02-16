import { startSock } from "./socket";
import { LazPlugin } from "./pluginSystem.plugin";
import { readdir } from "fs/promises";
import { LazarusMessage } from "./types";
import LazarusHandler from "./lazarusHandler";
import { cwd } from "process";
import path from "path";
type socket = Awaited<ReturnType<typeof startSock>>;

export class PluginSystem {
  sock: socket;
  pluginFolderPath: string;
  plugins: LazPlugin[] = [];
  constructor(sock: socket, pluginFolderPath: string) {
    this.sock = sock;
    this.pluginFolderPath = pluginFolderPath;
  }

  async loadPlugins() {
    try {
      const pluginFiles = await readdir(path.join(cwd(),this.pluginFolderPath));

      for await (const pluginFile of pluginFiles) {
        if (!pluginFile.endsWith(".plugin.js") && !pluginFile.endsWith(".plugin.mjs")){
          console.log("Skipping " + pluginFile);
          continue;
        }
        const plugin = (await import("file://"+path.join(cwd(),this.pluginFolderPath) + "/" + pluginFile)).default
        console.log(plugin);
        this.plugins.push(new plugin.default());
        console.log("Loaded " + pluginFile);
      }

      for await (const plugin of this.plugins) {
        await plugin.init();
      }

    } catch (error) {
      throw new Error("Error loading plugins" + error);
    }
  }

  async next(message: LazarusMessage, handler: LazarusHandler) {
    for (const plugin of this.plugins) {
      plugin.setHandler = handler;
      await plugin.onMessage(message);
    }
  }

  async reloadPlugins() {
    this.plugins = [];
    await this.loadPlugins();
  }
} 
