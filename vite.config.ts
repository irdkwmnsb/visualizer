import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { viteSingleFile } from "vite-plugin-singlefile"
import { visualizerCodegen } from "./plugin"

export default defineConfig({
    plugins: [visualizerCodegen(), react(), viteSingleFile()],
    server: {
        port: 3000,
    },
    build: {
        target: "esnext",
        emptyOutDir: true,
        outDir: "dist",
    },
})
