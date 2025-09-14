import { defineConfig, type ViteDevServer } from 'vite'
import type { AddressInfo } from 'node:net'
import { cp } from 'node:fs'
import { buildSync } from 'esbuild';
import { spawn } from 'node:child_process';
import vue from '@vitejs/plugin-vue'
import electron from 'electron';
import { join } from 'node:path';


function devPlugin() {
  return {
    name: "dev-plugin",
    configureServer(server: ViteDevServer) {
      buildSync({
        entryPoints: ["./src/main/mainEntry.ts"],
        bundle: true,
        platform: "node",
        outfile: "./dist/mainEntry.js",
        external: ["electron"],

      });

      buildSync({
        entryPoints: ["./src/preload/preload.ts"],
        bundle: true,
        platform: "node",
        outfile: "./dist/preload.js",
        external: ["electron"],
   
      });

      cp(join(__dirname, 'public'), join(__dirname, 'dist'), {
        recursive: true,
        preserveTimestamps: true,
        force: true,
        errorOnExist: false
      }, () => { });
      server.httpServer?.once("listening", () => {
        const addressInfo = server.httpServer?.address() as AddressInfo
        let httpAddress = `http://localhost:${addressInfo?.port}`;
        const electronPath = (electron as any).path || (electron as unknown as string);
        let electronProcess = spawn(electronPath, ["./dist/mainEntry.js", httpAddress], {
          cwd: process.cwd(),
          stdio: "inherit",
        });
        electronProcess.on("close", () => {
          server.close();
          process.exit();
        });
      });
    },
  };
};
// https://vite.dev/config/
export default defineConfig({
  plugins: [devPlugin(), vue()],
  base: './' 
})
