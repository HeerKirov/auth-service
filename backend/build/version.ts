import path from "path"
import fs from "fs"

const projectRoot = path.resolve(__dirname, "..")
const packageJsonPath = path.join(projectRoot, "package.json")
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, {encoding: "utf8"}))
console.log(pkg.version)