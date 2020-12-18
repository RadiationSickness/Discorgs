import { MessageEmbed } from 'discord.js';
import { DiscogsService } from './services/discogs/discogsService';
import { DiscordService } from './services/discord/discrodService';
import { DiscordDataBuilder } from './builders/discord/discordDataBuilder';
import { ReleasesResponseType } from './builders/discogs/types/releasesResponseTypes';
import { UserResponseType } from './builders/discogs/types/userResponseTypes';
import { DiscogsDataBuilder } from './builders/discogs/dataBuilder';
import { EmbedMessageType } from './builders/discord/discordTypes';

export class Discorg {
    public discogsService: DiscogsService;
    public discordService: DiscordService;
    public discordDataBuilder: DiscordDataBuilder;
    public discogsDataBuilder: DiscogsDataBuilder;

    constructor() {
        this.discogsService = new DiscogsService();
        this.discordService = new DiscordService();
        this.discordDataBuilder = new DiscordDataBuilder();
        this.discogsDataBuilder = new DiscogsDataBuilder();
    }

    public async start() {
        await this.discordService.login().then(async (status: string|undefined) => {
            status ? console.log('Login Successful!') : console.error('Login Failed');

            if (status) {
                // this.discordService.enableMessageListener();
                const response: ReleasesResponseType = await this.discogsService.getReleases('Tyharo');
                const user: UserResponseType = await this.discogsService.getUser('Tyharo');

                const singleEmbedData: EmbedMessageType = this.discogsDataBuilder.buildReleaseEmbedMessageData(response.releases[0], user);
                const messageEmbed: MessageEmbed = this.discordDataBuilder.buildEmbedMessage(singleEmbedData);
                // this.discordService.sendEmbed(messageEmbed);
            }
        });
    }
}