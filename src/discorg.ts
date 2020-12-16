import { DiscogsService } from "./services/discogs/discogsService";
import { EmbedMessageType } from "./services/discord/discordTypes";
import { DiscordService } from "./services/discord/discrodService";

export class Discorg {
    public discogsService: DiscogsService;
    public discordService: DiscordService;

    constructor() {
        this.discogsService = new DiscogsService();
        this.discordService = new DiscordService();
    }

    public async start() {
        await this.discordService.login().then(async (status: string|undefined) => {
            status ? console.log('Login Successful!') : console.error('Login Failed');

            if (status) {
                const response = await this.discogsService.getReleases('Tyharo');
                const user = await this.discogsService.getUser('Tyharo');
                console.log(user);
                const embedParams: EmbedMessageType = {
                    color: '#666666',
                    title: response.releases[0].basic_information.title,
                    url: response.releases[0].basic_information.master_url,
                    userImage: user.avatar_url,
                    description: 'foobar',
                    thumbnailUrl: response.releases[0].basic_information.cover_image,
                    userName: 'Tyharo',
                    artist: response.releases[0].basic_information.artists,
                    labels: response.releases[0].basic_information.labels,
                    genres: response.releases[0].basic_information.genres,
                    styles: response.releases[0].basic_information.styles,
                    year: response.releases[0].basic_information.year,
                };
                this.discordService.sendEmbed(embedParams);
            }
        });
    }
}