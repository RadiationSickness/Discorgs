import { Client, TextChannel } from 'discord.js';
import { DiscogsService } from './services/discogs/discogsService';
import { DiscordService } from './services/discord/discrodService';
import { DiscordDataBuilder } from './builders/discord/discordDataBuilder';
import { DiscogsDataBuilder } from './builders/discogs/dataBuilder';
import { MessageListener } from './services/messageListener/messageListener';
import { Commands } from './services/messageListener/commands';
import { MongodbService } from './services/mongodb/mongodbService';

export class Discorg {
    public discogsService: DiscogsService;
    public discordService: DiscordService;
    public discordDataBuilder: DiscordDataBuilder;
    public discogsDataBuilder: DiscogsDataBuilder;
    public mongodbService: MongodbService;

    constructor() {
        this.discogsService = new DiscogsService();
        this.discordService = new DiscordService();
        this.discordDataBuilder = new DiscordDataBuilder();
        this.discogsDataBuilder = new DiscogsDataBuilder();
        this.mongodbService = new MongodbService();
    }

    public async start() {
        // await this.mongodbService.set();
        // await this.discordService.login().then(async (status: boolean) => {
        //     status ? console.log('Login Successful!') : console.error('Login Failed!');

        //     if (status) {
        //         console.log('Initializing...');
        //         const commandsInstance: Commands = new Commands(this.discogsService, this.discordService);
        //         const messageListener = new MessageListener(
        //             this.discordService,
        //             commandsInstance,
        //         );
        //         messageListener.startMessageListener();
        //         console.log('Ready');
        //         // const response: ReleasesResponseType = await this.discogsService.getReleases('Tyharo');
        //         // const user: UserResponseType = await this.discogsService.getUser('Tyharo');

        //         // const singleEmbedData: EmbedMessageType = this.discogsDataBuilder.buildReleaseEmbedMessageData(response.releases[0], user);
        //         // const messageEmbed: MessageEmbed = this.discordDataBuilder.buildEmbedMessage(singleEmbedData);
        //         // this.discordService.sendEmbed(messageEmbed);
        //     }
        // });
    }
}