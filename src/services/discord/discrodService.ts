import { Client, MessageAttachment, MessageEmbed, TextChannel } from 'discord.js';
import { EmbedMessageType } from './discordTypes';

export class DiscordService {
    public discordClient: Client;
    public staticAssets: MessageAttachment[] = [];

    constructor() {
        this.discordClient = new Client();
        this.buildStaticAssets();
    }

    public async login(): Promise<string|undefined> {
        return await this.discordClient.login(process.env.DISCORD_TOKEN);
    }
    
    public sendEmbed(embedMessageParams: EmbedMessageType): void {
        const channelId: string = process.env.DISCORD_CHANNEL_ID || '';
        const channelColletion = <TextChannel>this.discordClient.channels.cache.get(channelId);

        if (channelColletion) {
            channelColletion.send(this.buildEmbed(embedMessageParams));
        }
    }

    private buildEmbed(params: EmbedMessageType): MessageEmbed {
        const geners = params.genres.join(', ');
        const styles = params.styles.join(', ');
        const embedMessage = new MessageEmbed()
            .setColor(params.color)
            .setTitle(params.title)
            .attachFiles(this.staticAssets)
            .setURL(params.url)
            .setAuthor('Discorgs', 'attachment://discorgIcon.jpg')
            .setThumbnail(params.userImage)
            .addFields(
                { name: 'Collection Update', value: `${params.userName} added ${params.title} by ${params.artist} to their collection!` },
                { name: 'Artist', value: params.artist[0].name, inline: true },
                { name: 'Year', value: params.year.toString(), inline: true },
                { name: 'Label', value: params.labels[0].name, inline: true },
                { name: 'Genres', value: geners, inline: true },
                { name: 'Genres', value: styles, inline: true },
            )
            .setImage(params.thumbnailUrl)
            .setTimestamp()
            .setFooter('Dircorgs thinks you should buy more records', 'attachment://discogsIcon.png');

        return embedMessage;
    }

    private buildStaticAssets(): void {
        this.staticAssets.push(new MessageAttachment('./src/assets/discogsIcon.png', 'discogsIcon.png'));
        this.staticAssets.push(new MessageAttachment('./src/assets/discorgIcon.jpg', 'discorgIcon.jpg'));
    }
}