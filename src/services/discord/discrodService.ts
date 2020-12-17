import { Client, MessageAttachment, MessageEmbed, TextChannel } from 'discord.js';

export class DiscordService {
    public discordClient: Client;

    constructor() {
        this.discordClient = new Client();
    }

    public async login(): Promise<string|undefined> {
        return await this.discordClient.login(process.env.DISCORD_TOKEN);
    }
    
    public sendEmbed(embedMessage: MessageEmbed): void {
        const channelId: string = process.env.DISCORD_CHANNEL_ID || '';
        const channelColletion = <TextChannel>this.discordClient.channels.cache.get(channelId);

        if (channelColletion) {
            channelColletion.send(embedMessage);
        }
    }
}