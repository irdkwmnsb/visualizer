/* @refresh reload */
import ReactDOM from "react-dom/client"
import App from "/src/App"
import { manifest, store } from "/src/visualizers/%%visName%%/index.tsx"

const root = document.getElementById("root")

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
    throw new Error(
        "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?",
    )
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    // <React.StrictMode>
    <App manifest={manifest} store={store}/>
    // </React.StrictMode>,
)