export type ReleasesResponseType = {
    pagination: PaginationType,
    releases: ReleasesType[],
}

export type PaginationType = {
    page: number,
    pages: number,
    per_page: number,
    items: number,
    urls: {
        last: string,
        next: string,
    }
}

export type ReleasesType = {
    id: number,
    instance_id: number,
    date_added: string,
    rating: number,
    basic_information: ReleasesBasicInfoType,
}

export type ReleasesBasicInfoType = {
    id: number,
    master_id: number,
    master_url: string,
    resource_url: string,
    thumb: string,
    cover_image: string,
    title: string,
    year: number,
    formats:ReleasesFormatsType[],
    labels: ReleasesLabelsType[],
    artists: ReleasesArtistsType[],
    genres: string[],
    styles: string[],
}

export type ReleasesFormatsType = {
    name: string,
    qty: string,
    text: string,
    descriptions: string[]
}

export type ReleasesLabelsType = {
    name: string,
    catno: string,
    entity_type: string,
    entity_type_name: string,
    id: number,
    resource_url: string,
}

export type ReleasesArtistsType = {
    name: string,
    anv: string,
    join: string,
    role: string,
    tracks: string,
    id: number,
    resource_url: string,
}
