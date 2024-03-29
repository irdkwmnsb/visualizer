import { Plugin, ViteDevServer } from "vite"
import fs from "node:fs/promises"
import path from "node:path"

type IndexTemplateParams = { visName: string };
const indexHTMLTemplatePath = path.resolve(__dirname, "index-template.html")
const indexTSTemplatePath = path.resolve(__dirname, "index-tsx-template.tsx")
const getTemplate = <T>(templPath: string) => async (props: T ): Promise<string> => {
    let templ = await fs.readFile(templPath, { encoding: "utf-8" })
    Object.entries(props).forEach(([propKey, propVal]) => {
        templ = templ.replaceAll(`%%${propKey}%%`, propVal)
    })
    return templ
}
const getIndexHTMLTemplate = getTemplate<IndexTemplateParams>(indexHTMLTemplatePath)
const getIndexTSTemplate = getTemplate<IndexTemplateParams>(indexTSTemplatePath)

export const visualizerCodegen = async (): Promise<Plugin> => {
    const visualizers = await fs.readdir("./src/visualizers") as string[]
    const visualizersEntries = visualizers.map(f => `${f}.html`)
    const matchVizByRegexp = (regex: RegExp) => (id: string) => {
        const match = id.match(regex)
        if(match === null) {
            return false
        }
        return visualizers.indexOf(match[1]) !== -1
    }
    const visEntryRegexp = /^\/?([a-z-0-9]+)(?:.html)?$/
    const isVisEntry = matchVizByRegexp(visEntryRegexp)
    const visIndexRegexp = /^\/([a-z-0-9]+).tsx$/
    const isVisIndex = matchVizByRegexp(visIndexRegexp)
    // const visualizersIndexes = visualizers.map(f => `./src/${f}.tsx`)
    console.log(`Loaded ${visualizers.length} visualizers: ${visualizers}`)
    
    return {
        name: "visualizer-codegen",
        enforce: "pre",
        async configureServer(server: ViteDevServer) {
            server.middlewares.use(async (req, res, next) => {
                const sendBody = (body: string) => {
                    res
                        .writeHead(200, {
                            "Content-Length": Buffer.byteLength(body),
                            "Content-Type": "text/html",
                        })
                        .end(body)
                }
                if(req.url === "/") {
                    const body = visualizersEntries.map((entry) => `<a href="${entry}">${entry}</a>`).join("<br>")
                    sendBody(body)
                } else if(isVisEntry(req.url)) {
                    const visName = req.url.replace("/", "").replace(".html", "")
                    const body = await server.transformIndexHtml(req.url, await getIndexHTMLTemplate({ visName }))
                    sendBody(body)
                } else {
                    next()
                }
            })
        },
        async options(options) {
            const newOptions = {
                ...options,
                input: visualizersEntries,
                output: {
                    inlineDynamicImports: false,
                },
            }
            return newOptions
        },
        resolveId: {
            order: "pre",
            async handler(source) {
                if(isVisEntry(source) || isVisIndex(source)) {
                    return source
                }
                return null
            }
        },
        async load(id, options) {
            if (isVisEntry(id)) {
                const [_, visName] = id.match(visEntryRegexp)
                return await getIndexHTMLTemplate({visName})
            } else if(isVisIndex(id)) {
                const [_, visName] = id.match(visIndexRegexp)
                return await getIndexTSTemplate({visName})
            }
        },
    }
}
