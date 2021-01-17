import { PaginationType, ReleasesArtistsType, ReleasesBasicInfoType, ReleasesLabelsType } from "./releasesResponseTypes"

export type WantsResponseType = {
    pagination: PaginationType,
    wants: WantsType[],
}

export type WantsType = {
    id: number,
    resource_url: string,
    rating: number,
    date_added: string,
    basic_information: WantsBasicInfoType,
}

type WantsBasicInfoType = {
    formats: formatType[],
    thumb: string,
    cover_image: string,
    title: string,
    labels: ReleasesLabelsType[],
    artists: ReleasesArtistsType[],
    year: number,
    id: number,
    resource_url: string,
}

type formatType = {
    text: string,
    qty: string,
    descriptions: string[],
    name: string,
}
