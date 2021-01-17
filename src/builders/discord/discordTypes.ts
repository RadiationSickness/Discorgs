export type ReleaseEmbedMessageType = {
    artist: string,
    color: string,
    genres: string,
    labels: string,
    styles: string,
    mediaImage: string,
    title: string,
    url: string,
    userImage: string,
    userName: string,
    year: number
}

export type WantsEmbedMessageType = {
    artist: string,
    color: string,
    title: string,
    url: string,
    userImage: string,
    userName: string,
}

export type UserEmbedMessageType = {
    color: string,
    profileUri: string,
    title: string,
    userImage: string,
    userName: string,
}