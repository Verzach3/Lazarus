import { copy } from "fs-extra";
import path from "path";
import { cwd } from "process";

export default async function unpackPlugins(){
  const orgPath = path.join(__dirname, "../plugins")
  const destPath = path.join(cwd(), "/plugins");
  try {
    await copy(orgPath, destPath, {
      overwrite: true
    })
  } catch {}
  console.log(orgPath, destPath)
}
