import { move } from "fs-extra";
import path from "path";
import { cwd } from "process";

export default async function unpackPlugins(){
  const orgPath = path.join(__dirname, "../plugins")
  const destPath = path.join(cwd(), "/plugins");
  await move(orgPath, destPath, {
    overwrite: true
  })
  console.log(orgPath, destPath)
}
