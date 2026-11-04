/**
 * Prepara los artefactos que el escritorio necesita y que no deben vivir en git:
 *
 *   node scripts/prepare-desktop.mjs            # solo assets (Tailwind vendorizado)
 *   node scripts/prepare-desktop.mjs --bundle   # + Node, Chromium y el sidecar
 *
 * El bundle deja en `src-tauri/resources` el script del sidecar, el Tailwind
 * inlineable y los `.br` de Chromium, y en `src-tauri/binaries` el Node que lo
 * ejecuta (Tauri lo copia junto al binario principal como sidecar).
 */
import { execFileSync } from "node:child_process";
import { chmodSync, copyFileSync, existsSync, mkdirSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const TAILWIND_SRC = path.join(ROOT, "node_modules/@tailwindcss/browser/dist/index.global.js");
const RESOURCES = path.join(ROOT, "src-tauri/resources");
const BINARIES = path.join(ROOT, "src-tauri/binaries");
const CACHE = path.join(BINARIES, ".cache");

/** Node oficial (no el del sistema: en Homebrew es un binario compartido). */
const NODE_VERSION = process.env.TC_NODE_VERSION || "v24.22.2";

function copyTailwind() {
  const targets = [
    path.join(ROOT, "public/vendor/tailwind.js"),
    path.join(RESOURCES, "tailwind.js"),
  ];
  for (const target of targets) {
    mkdirSync(path.dirname(target), { recursive: true });
    copyFileSync(TAILWIND_SRC, target);
  }
}

/** Triple del host, que es el sufijo que Tauri espera en `binaries/`. */
function hostTriple() {
  const rustc = execFileSync("rustc", ["-vV"], { encoding: "utf8" });
  const host = rustc.match(/^host:\s*(\S+)$/m)?.[1];
  if (!host) throw new Error("No se pudo leer el host de rustc");
  if (!host.includes("linux")) throw new Error(`Sin binarios para ${host}: por ahora solo Linux`);
  return host;
}

async function downloadNode(triple) {
  const sidecar = path.join(BINARIES, `pdf-render-${triple}`);
  if (existsSync(sidecar)) return;

  mkdirSync(CACHE, { recursive: true });
  const tarball = path.join(CACHE, `node-${NODE_VERSION}-linux-x64.tar.xz`);
  const url = `https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.xz`;
  if (!existsSync(tarball)) {
    console.log(`descargando ${url}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`No se pudo descargar Node: HTTP ${response.status}`);
    writeFileSync(tarball, Buffer.from(await response.arrayBuffer()));
  }

  // `--strip-components=2` deja `node-vX-linux-x64/bin/node` como `node`.
  const extracted = path.join(CACHE, "node");
  rmSync(extracted, { force: true });
  execFileSync("tar", ["-xJf", tarball, "-C", CACHE, "--strip-components=2", `node-${NODE_VERSION}-linux-x64/bin/node`]);
  renameSync(path.join(CACHE, "node"), sidecar);
  chmodSync(sidecar, 0o755);
  console.log(`sidecar listo: ${path.relative(ROOT, sidecar)}`);
}

function copyChromium() {
  const source = path.join(ROOT, "node_modules/@sparticuz/chromium/bin");
  const target = path.join(RESOURCES, "chromium");
  mkdirSync(target, { recursive: true });
  for (const file of readdirSync(source)) {
    if (!file.endsWith(".br")) continue;
    const from = path.join(source, file);
    const to = path.join(target, file);
    if (!existsSync(to)) copyFileSync(from, to);
  }
}

function bundleSidecar() {
  const esbuild = path.join(ROOT, "node_modules/.bin/esbuild");
  execFileSync(
    esbuild,
    [
      "desktop/pdf-render.ts",
      "--bundle",
      "--format=cjs",
      "--platform=node",
      "--external:bufferutil",
      "--external:utf-8-validate",
      `--outfile=${path.join(RESOURCES, "pdf-render.cjs")}`,
    ],
    { cwd: ROOT, stdio: "inherit" },
  );
}

copyTailwind();
if (!process.argv.includes("--bundle")) process.exit(0);

const triple = hostTriple();
mkdirSync(RESOURCES, { recursive: true });
copyChromium();
await downloadNode(triple);
bundleSidecar();
console.log("desktop listo");
