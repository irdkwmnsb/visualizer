/* @refresh reload */
import ReactDOM from "react-dom/client"
import { StrictMode } from "react"
import { enableMapSet } from "immer"

import Index from "/src/Index"

enableMapSet()


const root = document.getElementById("root")

const manifests = %%manifests%%

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
    throw new Error(
        "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?",
    )
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <StrictMode>
        <Index visualizers={manifests}/>
    </StrictMode>,
)