import { PaginationType, ReleasesBasicInfoType } from "./releasesResponseTypes"

export type WantsResponseType = {
    pagination: PaginationType,
    wants: WantsType[],
}

type WantsType = {
    id: number,
    resource_url: string,
    rating: number,
    date_added: string,
    basic_information: ReleasesBasicInfoType,
}
