/* @refresh reload */
import ReactDOM from "react-dom/client"
import { StrictMode } from "react"
import { store, manifest } from "/src/visualizers/%%visName%%"
import { enableMapSet } from "immer"

import App from "/src/App"

enableMapSet()


const root = document.getElementById("root")

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
    throw new Error(
        "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?",
    )
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <StrictMode>
        <App manifest={manifest} store={store}/>
    </StrictMode>,
)