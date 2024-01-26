/* @refresh reload */
import ReactDOM from "react-dom/client"
import App from "./App"
import { store, manifest } from "./visualizers/bubble-sort"
import React from "react"

const root = document.getElementById("root")

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
    throw new Error(
        "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?",
    )
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <App store={store} manifest={manifest}/>
    </React.StrictMode>,
)
