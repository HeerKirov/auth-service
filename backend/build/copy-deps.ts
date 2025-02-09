import path from "path"
import fs from "fs"

function copyDependencies(src: string, dest: string, dependencies: string[]) {
    for(const dependency of dependencies) {
        const SRC_DIR = path.join(src, dependency)
        const TARGET_DIR = path.join(dest, dependency)
        if(fs.existsSync(SRC_DIR)) {
            if(!fs.existsSync(TARGET_DIR)) {
                fs.cpSync(SRC_DIR, TARGET_DIR, { recursive: true, dereference: true, preserveTimestamps: true })
                const pkg = JSON.parse(fs.readFileSync(path.join(SRC_DIR, "package.json"), {encoding: "utf8"}))
                const subDeps = pkg["dependencies"] ? Object.keys(pkg["dependencies"]) : null
                if(subDeps && subDeps.length > 0) {
                    copyDependencies(src, dest, subDeps)
                }
            }
        }else{
            console.warn(`[copyDependencies] '${dependency}' not found in node_modules.`)
        }
    }
}

function linkBinary(dest: string, bin: string, file: string) {
    const TARGET_DIR = path.join(dest, ".bin")
    const TARGET_BIN = path.join(dest, ".bin", bin)
    if(!fs.existsSync(TARGET_BIN)) {
        if(!fs.existsSync(TARGET_DIR)) fs.mkdirSync(TARGET_DIR, { recursive: true })
        fs.symlinkSync(path.join("..", bin, "bin", file), TARGET_BIN)
    }
}

function readPackageDependencies(src: string) {
    const pkg = JSON.parse(fs.readFileSync(src, {encoding: "utf8"}))
    return pkg["dependencies"] ? Object.keys(pkg["dependencies"]) : []
}

function cleanExists(src: string) {
    if(fs.existsSync(src)) {
        fs.rmSync(src, { recursive: true, force: true })
    }
}

function copyPackageJson(src: string, dest: string) {
    fs.cpSync(src, dest)
}

const projectRoot = path.resolve(__dirname, "..")
const packageJsonPath = path.join(projectRoot, "package.json")
const nodeModulesPath = path.join(projectRoot, "node_modules")
const distNodeModulesPath = path.join(projectRoot, "dist", "node_modules")
const distPackagePath = path.join(projectRoot, "dist", "package.json")

cleanExists(distNodeModulesPath)
copyPackageJson(packageJsonPath, distPackagePath)
copyDependencies(nodeModulesPath, distNodeModulesPath, readPackageDependencies(packageJsonPath))
linkBinary(distNodeModulesPath, "knex", "cli.js")