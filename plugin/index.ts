import { Plugin, ViteDevServer } from "vite"
import fs from "node:fs/promises"
import path from "node:path"

type VisTemplateParams = { visName: string };
type IndexTemplateParams = { manifests: string };
const visHTMLTemplatePath = path.resolve(__dirname, "vis-template.html")
const visTSTemplatePath = path.resolve(__dirname, "vis-tsx-template.tsx")
const indexHTMLTemplatePath = path.resolve(__dirname, "index-template.html")
const indexTSTemplatePath = path.resolve(__dirname, "index-tsx-template.tsx")
const getTemplate = <T extends Record<string, string>>(templPath: string) => async (props: T): Promise<string> => {
    let templ = await fs.readFile(templPath, { encoding: "utf-8" })
    Object.entries(props).forEach(([propKey, propVal]) => {
        templ = templ.replaceAll(`%%${propKey}%%`, propVal)
    })
    return templ
}
const getIndexHTMLTemplate = getTemplate<IndexTemplateParams>(indexHTMLTemplatePath)
const getIndexTSTemplate = getTemplate<IndexTemplateParams>(indexTSTemplatePath)
const getVisHTMLTemplate = getTemplate<VisTemplateParams>(visHTMLTemplatePath)
const getVisTSTemplate = getTemplate<VisTemplateParams>(visTSTemplatePath)

export const visualizerCodegen = async (): Promise<Plugin> => {
    const singleVis = process.env["VISUALIZER_SINGLE"]
    const visualizers = singleVis === undefined ? await fs.readdir("./src/visualizers") as string[] : [singleVis]
    if (visualizers.indexOf("index") !== -1) {
        console.error("Don't use 'index' for visualizer names")
        process.exit(-1)
    }
    const visualizersEntries = visualizers.map(f => `${f}.html`)
    if (singleVis === undefined) {
        visualizersEntries.push("index.html")
    }
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
                if (req.url === undefined) {
                    next()
                } else if (req.url === "/") {
                    const _ = req.url.replace("/", "").replace(".html", "")
                    const body = await server.transformIndexHtml(req.url, await getIndexHTMLTemplate({ manifests: JSON.stringify(visualizers) }))
                    sendBody(body)
                } else if(isVisEntry(req.url)) {
                    const visName = req.url.replace("/", "").replace(".html", "")
                    const body = await server.transformIndexHtml(req.url, await getVisHTMLTemplate({ visName }))
                    sendBody(body)
                } else {
                    next()
                }
            })
        },
        async options(options) {
            const newOptions = {
                ...options,
                input: visualizersEntries
            }
            return newOptions
        },
        resolveId: {
            order: "pre",
            async handler(source) {
                if(isVisEntry(source) || isVisIndex(source) || source === "index.html" || source === "/index.tsx") {
                    return source
                }
                return null
            }
        },
        async load(id) {
            if (id === "index.html") {
                return await getIndexHTMLTemplate({manifests: JSON.stringify(visualizers)})
            } else if (id === "/index.tsx") {
                return await getIndexTSTemplate({manifests: JSON.stringify(visualizers)})
            } else if (isVisEntry(id)) {
                const [_, visName] = id.match(visEntryRegexp)!
                return await getVisHTMLTemplate({visName})
            } else if(isVisIndex(id)) {
                const [_, visName] = id.match(visIndexRegexp)!
                return await getVisTSTemplate({visName})
            }
        },
    }
}
