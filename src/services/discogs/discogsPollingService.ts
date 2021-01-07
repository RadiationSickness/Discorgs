import { ReleasesResponseType, ReleasesType } from "../../builders/discogs/types/releasesResponseTypes";
import { Nullable } from "../../universalTypes";
import { DiscordService } from "../discord/discrodService";
import { MongodbService } from "../mongodb/mongodbService";
import { DiscogsService } from "./discogsService";
import { DiscogsDataBuilder } from '../../builders/discogs/dataBuilder';
import { DiscordDataBuilder } from '../../builders/discord/discordDataBuilder';
import { UserEmbedData } from '../../builders/discogs/types/userResponseTypes';
import { ReleaseEmbedMessageType } from "../../builders/discord/discordTypes";
import { MessageEmbed } from "discord.js";

type userPoolResponse = {
    userPools: string[][],
    pollingInterval: number,
}

export class DiscogsPollingService {
    private discogsDataBuilder: DiscogsDataBuilder;
    private discordDataBuilder: DiscordDataBuilder;

    constructor(
        public discogsService: DiscogsService,
        public discordService: DiscordService,
        public mongodbService: MongodbService,
    ) {
        this.discogsDataBuilder = new DiscogsDataBuilder();
        this.discordDataBuilder = new DiscordDataBuilder();
    }

    public async initiatePolling(): Promise<void> {
        const userPool: userPoolResponse = await this.getUserPool();
        const totalPools: number = userPool.userPools.length;
        let currentPool: number = 0;

        await this.mongodbService.updateUserAttribute('135813831237566465', 'lastCollectionItemId', 13935998);

        setInterval(async () => {
            userPool.userPools[currentPool].forEach(async (user) => {
                await this.checkForNewAdditions(user);
            });
        }, userPool.pollingInterval);

        console.log('Ready');
    }

    // @TODO: check if id has been removed prior to building messages
    private async checkForNewAdditions(user: string): Promise<void> {
        const dbUser = await this.mongodbService.getUserByID(user) as any;

        if (dbUser && dbUser.discogsUserName) {
            const discogsRelease: ReleasesResponseType = await this.discogsService.getReleases(dbUser.discogsUserName);
            const userData: UserEmbedData = {
                userName: dbUser.discogsUserName,
                userImage: dbUser.discogsUserImage,
            };

            if (dbUser.lastCollectionItemId && discogsRelease && discogsRelease.releases.length > 0 ) {
                if (dbUser.lastCollectionItemId === discogsRelease.releases[0].id) {
                    return Promise.resolve();
                }

                let embedQueue: MessageEmbed[] = [];
                
                for (let arrayPostion: number = 0; discogsRelease.releases[arrayPostion].id != dbUser.lastCollectionItemId.toString(); arrayPostion++) {
                    const releaseEmbedData: ReleaseEmbedMessageType = this.discogsDataBuilder.buildReleaseEmbedMessageData(discogsRelease.releases[arrayPostion], userData);
                    const discordEmbed: MessageEmbed = this.discordDataBuilder.buildReleaseEmbedMessage(releaseEmbedData);

                    embedQueue.push(discordEmbed);
                }

                if (embedQueue.length > 0) {
                    embedQueue = embedQueue.reverse();

                    embedQueue.forEach((embed: MessageEmbed) => {
                        this.discordService.sendEmbed(embed);
                    });
                }

                await this.mongodbService.updateUserAttribute(user, 'lastCollectionItemId', discogsRelease.releases[0].id);
            }
        }

        return Promise.resolve();
    }

    private async getUserPool(): Promise<userPoolResponse> {
        const groupingLimit: number = 50;
        const userArray: string[] = await this.mongodbService.getAllUserIDs();
        const userPools: string[][] = [];

        for (let i = 0; i < userArray.length; i += groupingLimit) {
            userPools.push(userArray.slice(i, i+groupingLimit));
        }

        const pollingInterval = this.calculatePollingInterval(userArray.length);
        
        return Promise.resolve({
            userPools,
            pollingInterval,
        });
    }

    private calculatePollingInterval(numberOfUsers: number): number {
        let pollingInterval: number = 60000;
        // NOTE: Only 60 requests allowed per minute to Discogs API
        const allowedCallsPerMinute: number = 60;
        const bufferedAllowedCallsPerMinute: number = 50;

        if (numberOfUsers === (bufferedAllowedCallsPerMinute / 2)) {
            return pollingInterval / 2; // NOTE: call every 30 seconds
        }

        if (numberOfUsers === (Math.floor(bufferedAllowedCallsPerMinute / 4))) {
            return pollingInterval / 4; // NOTE: call every 15 seconds
        }

        if (numberOfUsers <= (Math.floor(bufferedAllowedCallsPerMinute / 6))) {
            return pollingInterval / 6; // NOTE: call every 10 seconds
        }

        return pollingInterval
    }
}