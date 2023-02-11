"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pluginSystem_plugin_1 = require("../pluginSystem.plugin");
class ExamplePlugin extends pluginSystem_plugin_1.LazPlugin {
    constructor() {
        super();
    }
    async onMessage(message) {
    }
}
exports.default = ExamplePlugin;
