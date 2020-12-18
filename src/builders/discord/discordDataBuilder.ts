import { MessageEmbed, MessageAttachment } from 'discord.js';
import { EmbedMessageType } from './discordTypes';

export class DiscordDataBuilder {
    public staticAssets: MessageAttachment[] = [];

    constructor() {
        this.buildStaticAssets();
    }

    public buildEmbedMessage(params: EmbedMessageType): MessageEmbed {
        return new MessageEmbed()
            .setColor(params.color)
            .setTitle(params.title)
            .attachFiles(this.staticAssets)
            .setURL(params.url)
            .setAuthor('Discorgs', 'attachment://discorgIcon.jpg')
            .setThumbnail(params.userImage)
            .addFields(
                { name: 'Collection Update', value: `${params.userName} added ${params.title} by ${params.artist} to their collection!` },
                { name: 'Artist', value: params.artist, inline: true },
                { name: 'Year', value: params.year.toString(), inline: true },
                { name: 'Label', value: params.labels, inline: true },
                { name: 'Genres', value: params.genres, inline: true },
                { name: 'Styles', value: params.styles, inline: true },
            )
            .setImage(params.mediaImage)
            .setTimestamp()
            .setFooter('Dircorgs thinks you should buy more records', 'attachment://discogsIcon.png');

    }

    private buildStaticAssets(): void {
        this.staticAssets.push(new MessageAttachment('./src/assets/discogsIcon.png', 'discogsIcon.png'));
        this.staticAssets.push(new MessageAttachment('./src/assets/discorgIcon.jpg', 'discorgIcon.jpg'));
    }
}