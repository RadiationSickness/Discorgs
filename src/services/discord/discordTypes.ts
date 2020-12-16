export type EmbedMessageType = {
    color: string,
    title: string,
    userImage: string,
    url: string,
    description: string,
    thumbnailUrl: string,
    userName: string,
    artist: Record<string, string>[],
    labels: Record<string, string>[],
    genres: string[],
    styles: string[],
    year: number
}