import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
// import { viteSingleFile } from "vite-plugin-singlefile"
import Inspect from "vite-plugin-inspect"
import svgr from "vite-plugin-svgr"
import { visualizerCodegen } from "./plugin/index"
// import { resolve } from "path"

export default defineConfig({
    plugins: [
        Inspect(),
        visualizerCodegen(), 
        react(), 
        svgr()
        // viteSingleFile()
    ],
    server: {
        port: 3000,
    },
    build: {
        target: "esnext",
        emptyOutDir: true,
        outDir: "dist",
    },
})
