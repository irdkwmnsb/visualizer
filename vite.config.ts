import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
// import { viteSingleFile } from "vite-plugin-singlefile"
// import Inspect from "vite-plugin-inspect"
import { visualizerCodegen } from "./plugin/index"
// import { resolve } from "path"

export default defineConfig({
    plugins: [
        // Inspect(),
        visualizerCodegen(), 
        react(), 
        // viteSingleFile()
    ],
    // appType: "custom",
    server: {
        port: 3000,
    },
    build: {
        target: "esnext",
        emptyOutDir: true,
        outDir: "dist",
        // rollupOptions: {
        //     input: {
        //         main: resolve(__dirname, 'index.html'),
        //         "bubble-sort": resolve(__dirname, 'test.html')
        //     }
        // }
    },
})
