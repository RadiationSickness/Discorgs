import { Client, Message, MessageAttachment, MessageEmbed, TextChannel } from 'discord.js';

export class DiscordService {
    public discordClient: Client;
    private channelId: string;

    constructor() {
        this.discordClient = new Client();
        this.channelId = process.env.DISCORD_CHANNEL_ID || ''
    }

    public async login(): Promise<string|undefined> {
        return await this.discordClient.login(process.env.DISCORD_TOKEN);
    }
    
    public sendEmbed(embedMessage: MessageEmbed): void {
        const channelColletion = <TextChannel>this.discordClient.channels.cache.get(this.channelId);

        if (channelColletion) {
            channelColletion.send(embedMessage);
        }
    }

    // @TODO: Find way to check and store cahnnel info... or wait for cache to populate
    // public enableMessageListener(): void {
    //     this.discordClient.on('message', (message: Message) => {
    //         const channelColletion = <TextChannel>this.discordClient.channels.cache.get(this.channelId);
    //         const authorId = message.author.id.toString();
    //         if (channelColletion && message.author.username === 'Radiation') {
    //             channelColletion.send(`Hi <@${authorId}>`);
    //         }
    //     })
    // }
}