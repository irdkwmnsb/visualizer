

type IndexProps = {
    visualizers: string[]; // FIXME: this thould probably be a list of manifests, but that would require importing all of them in this entrypoint, bloating it to hell. But maybe that's exactly what I need..
}

export const Index = ({visualizers}: IndexProps) => {
    return <ul>
        {visualizers.map((entry) => (
            <li key={entry}>
                <a href={import.meta.env.BASE_URL + entry + ".html"}>
                    {entry}
                </a>
            </li>
        ))}
    </ul>
}

export default Index
