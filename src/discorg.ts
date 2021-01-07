import { Client, TextChannel } from 'discord.js';
import { DiscogsService } from './services/discogs/discogsService';
import { DiscordService } from './services/discord/discrodService';
import { DiscordDataBuilder } from './builders/discord/discordDataBuilder';
import { DiscogsDataBuilder } from './builders/discogs/dataBuilder';
import { MessageListener } from './services/messageListener/messageListener';
import { Commands } from './services/messageListener/commands';
import { MongodbService } from './services/mongodb/mongodbService';
import { DiscogsPollingService } from './services/discogs/discogsPollingService';

export class Discorg {
    private discogsService: DiscogsService;
    private discordService: DiscordService;
    private mongodbService: MongodbService;

    constructor() {
        this.discogsService = new DiscogsService();
        this.discordService = new DiscordService();
        this.mongodbService = new MongodbService();
    }

    public async start() {
        await this.discordService.login().then(async (status: boolean) => {
            status ? console.log('Login Successful!') : console.error('Login Failed!');

            if (status) {
                console.log('Initializing...');
                const pollingService: DiscogsPollingService = new DiscogsPollingService(
                    this.discogsService,
                    this.discordService,
                    this.mongodbService,
                );
                const commandsInstance: Commands = new Commands(
                    this.discogsService,
                    this.discordService,
                    this.mongodbService,
                );
                const messageListener: MessageListener = new MessageListener(
                    this.discordService,
                    commandsInstance,
                );
                messageListener.startMessageListener();
                pollingService.initiatePolling();
            }
        });
    }
}