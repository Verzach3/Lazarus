import { UniversalCache } from "youtubei.js"
import { Innertube } from "youtubei.js"
import { Plugin } from "../plugins"
 
export default function youtubePlugin(): Plugin {
  let yt: Awaited<ReturnType<typeof Innertube.create>>
  return {
    name: "Youtube Download",
    version: "1.0.0",
    author: "Verzach3",
    description: "A plugin to download music/video from Youtube",
    onInit: async (_client, _ws) => {
      yt = await Innertube.create({
        cache: new UniversalCache(false),
        generate_session_locally: true
      })
    },
    onDestroy: async () => {},
    onMessage: async (message, client, ws) => {
      if (message.body.split(" ")[0] === "!yt") return
      console.log("Invoked")
      const id = message.body.split(" ")[1]!.split("=")[1]
      console.log(await yt.getBasicInfo(id))
    }
  }
}
