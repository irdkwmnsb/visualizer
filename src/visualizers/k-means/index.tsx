import { IAlgorithmManifest, initAlgo } from "../../core/manifest"
import { KMeansArguments, KMeansEvent, KMeansState, kMeans } from "./k-means"
import { BubbleSortRender } from "./render"
import { BubbleSortStarter } from "./start"

type KMeansManifest = IAlgorithmManifest<
    KMeansState, 
    KMeansEvent, 
    KMeansArguments
>

export const manifest: KMeansManifest = {
    algo: kMeans,
    startComponent: BubbleSortStarter,
    renderComponent: BubbleSortRender,
    nameEn: "K-Means clustering",
    descriptionEn: "Clustering algorithm https://en.wikipedia.org/wiki/K-means_clustering",
    authorEn: "Alzhanov Maxim",
    nameRu: "Метод K-средних",
    descriptionRu: "Алгоритм кластеризации https://ru.wikipedia.org/wiki/%D0%9C%D0%B5%D1%82%D0%BE%D0%B4_k-%D1%81%D1%80%D0%B5%D0%B4%D0%BD%D0%B8%D1%85",
    authorRu: "Альжанов Максим"
}

export const { bind, here, update, store } = initAlgo<
    KMeansState, 
    KMeansEvent, 
    KMeansArguments,
    KMeansManifest
>(manifest)

