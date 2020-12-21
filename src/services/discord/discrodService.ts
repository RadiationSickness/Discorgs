import { Client, Message, MessageAttachment, MessageEmbed, TextChannel } from 'discord.js';
import { Nullable } from '../../universalTypes';

export class DiscordService {
    public discordClient: Client;
    private channelId: string;
    private textChannel: TextChannel | undefined;

    constructor() {
        this.discordClient = new Client();
        this.channelId = process.env.DISCORD_CHANNEL_ID || ''
    }

    public async login(): Promise<boolean> {
        const status: boolean = false;
        const intervalAmount: number = 1000;
        let retryAmount: number = 30;

        const loginStatus = await this.discordClient.login(process.env.DISCORD_TOKEN);

        if (loginStatus) {
            return new Promise((resolve, reject) => {
                const interval = setInterval(async () => {
                    const channelCache = <TextChannel>this.discordClient.channels.cache.get(this.channelId);
                    if (channelCache) {
                        this.textChannel = channelCache;
                        resolve(true);
                        clearInterval(interval);
                    } else if (retryAmount <= 1) {
                        reject(false);
                        clearInterval(interval);
                    }
                    retryAmount--;
                }, intervalAmount);
            });
        }

        return Promise.resolve(status);
    }
    
    public sendEmbed(embedMessage: MessageEmbed): void {
        if (this.textChannel) {
            this.textChannel.send(embedMessage);
        }
    }

    public getClient(): Client {
        return this.discordClient;
    }

    public getTextChannel():Nullable<TextChannel> {
        return this.textChannel ? this.textChannel : null;
    }
}