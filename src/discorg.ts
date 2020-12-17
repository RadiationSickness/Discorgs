import { DiscogsService } from './services/discogs/discogsService';
import { DiscordService } from './services/discord/discrodService';
import { DiscordDataBuilder } from './builders/discord/discordDataBuilder';
import { ReleasesResponseType } from './builders/discogs/types/releasesResponseTypes';
import { UserResponseType } from './builders/discogs/types/userResponseTypes';

export class Discorg {
    public discogsService: DiscogsService;
    public discordService: DiscordService;
    public discordDataBuilder: DiscordDataBuilder;

    constructor() {
        this.discogsService = new DiscogsService();
        this.discordService = new DiscordService();
        this.discordDataBuilder = new DiscordDataBuilder();
    }

    public async start() {
        await this.discordService.login().then(async (status: string|undefined) => {
            status ? console.log('Login Successful!') : console.error('Login Failed');

            if (status) {
                // const response: ReleasesResponseType = await this.discogsService.getReleases('Tyharo');
                // const user: UserResponseType = await this.discogsService.getUser('Tyharo');

                // const embedMessage = this.discordDataBuilder.buildEmbedMessage(response);
                // this.discordService.sendEmbed(embedParams);
            }
        });
    }
}