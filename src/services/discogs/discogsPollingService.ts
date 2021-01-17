import { ReleasesResponseType, ReleasesType } from '../../builders/discogs/types/releasesResponseTypes';
import { DiscordService } from "../discord/discrodService";
import { MongodbService } from "../mongodb/mongodbService";
import { DiscogsService } from "./discogsService";
import { DiscogsDataBuilder } from '../../builders/discogs/dataBuilder';
import { DiscordDataBuilder } from '../../builders/discord/discordDataBuilder';
import { UserEmbedData } from '../../builders/discogs/types/userResponseTypes';
import { ReleaseEmbedMessageType, WantsEmbedMessageType } from "../../builders/discord/discordTypes";
import { MessageEmbed } from "discord.js";
import moment from 'moment';
import { WantsResponseType, WantsType } from '../../builders/discogs/types/wantsResponseTypes';

type UserPoolResponse = {
    userPools: string[][],
    pollingInterval: number,
}

enum ReleaseFormatType {
    collection = 'collection',
    wants = 'wants',
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
        let userPool: UserPoolResponse = await this.getUserPool();
        let totalPools: number = userPool.userPools.length;
        let currentPool: number = 0;

        setInterval(async () => {
            if (userPool.userPools.length > 0) {
                userPool.userPools[currentPool].forEach(async (user) => {
                    await this.checkForNewAdditions(user);
                });
            } else {
                userPool = await this.getUserPool();
                totalPools = userPool.userPools.length;
            }
        }, userPool.pollingInterval);

        console.log('Ready');
    }

    private async checkForNewAdditions(userId: string): Promise<void> {
        const dbUser = await this.mongodbService.getUserByID(userId) as any;

        if (dbUser && dbUser.discogsUserName) {
            const discogsReleases: ReleasesResponseType = await this.discogsService.getReleases(dbUser.discogsUserName);
            // @TODO: change message color: add -> green, notifications -> blue, wants -> orange
            const discogsWants: WantsResponseType = await this.discogsService.getWants(dbUser.discogsUserName);
            const userData: UserEmbedData = {
                userName: dbUser.discogsUserName,
                userImage: dbUser.discogsUserImage,
            };

            if (dbUser.lastCollectionItemId && discogsReleases && discogsReleases.releases?.length > 0 ) {
                await this.processNewAddition(dbUser, discogsReleases, userData, ReleaseFormatType.collection);
            }

            if (dbUser.lastCollectionItemId && discogsWants && discogsWants.wants?.length > 0 ) {
                await this.processNewAddition(dbUser, discogsWants, userData, ReleaseFormatType.wants);
            }
        }

        return Promise.resolve();
    }

    private async processNewAddition(
        dbUser: any,
        discogsReleases: ReleasesResponseType | WantsResponseType,
        userData: UserEmbedData, 
        releaseType: ReleaseFormatType, 
    ): Promise<void> {
        let releases: ReleasesType[] | WantsType[];

        if (releaseType === ReleaseFormatType.wants) {
            const wantsResponse: WantsResponseType = discogsReleases as WantsResponseType;
            releases = wantsResponse.wants;
        } else {
            const releasesResponse: ReleasesResponseType = discogsReleases as ReleasesResponseType;
            releases = releasesResponse.releases;
        }

        let storedReleaseId: number = releaseType === ReleaseFormatType.wants ? dbUser.lastWantListItemId : dbUser.lastCollectionItemId;

        let embedQueue: MessageEmbed[] = [];

        if (storedReleaseId === releases[0].id) {
            return Promise.resolve();
        }

        const lastItemIdDeleted: boolean = await this.wasLastReleaseDeleted(dbUser.discogsUserName, storedReleaseId);

        if (lastItemIdDeleted) {
            storedReleaseId = await this.getPreviouslyAddedItemID(dbUser.updatedAt, releases);
        }
        
        for (let arrayPostion: number = 0; releases[arrayPostion].id != storedReleaseId; arrayPostion++) {
            if (releaseType === ReleaseFormatType.collection) {
                const releaseEmbedData: ReleaseEmbedMessageType = this.discogsDataBuilder.buildReleaseEmbedMessageData(<ReleasesType>releases[arrayPostion], userData);
                const discordEmbed: MessageEmbed = this.discordDataBuilder.buildReleaseEmbedMessage(releaseEmbedData);
    
                embedQueue.push(discordEmbed);
            }

            if (releaseType === ReleaseFormatType.wants) {
                const wantEmbedData: WantsEmbedMessageType = this.discogsDataBuilder.buildWantsEmbedMessageData(<WantsType>releases[arrayPostion], userData);
                const discordEmbed: MessageEmbed = this.discordDataBuilder.buildWantEmbedMessage(wantEmbedData);
    
                embedQueue.push(discordEmbed);
            }
        }

        if (embedQueue.length > 0) {
            embedQueue = embedQueue.reverse();

            embedQueue.forEach((embed: MessageEmbed) => {
                this.discordService.sendEmbed(embed);
            });
        }

        const dbIdAttribute: string = releaseType === ReleaseFormatType.wants ? 'lastWantListItemId' : 'lastCollectionItemId';
        await this.mongodbService.updateUserAttribute(dbUser._id , dbIdAttribute, releases[0].id);
    }

    private async getUserPool(): Promise<UserPoolResponse> {
        const groupingLimit: number = 25;
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

    private async getPreviouslyAddedItemID(lastUpdated: string, releases: ReleasesType[] | WantsType[]): Promise<number> {
        const lastUpdateDate = moment(lastUpdated);
        let newReleaseID: number = releases[0].id;

        for (let release of releases) {
            const releaseAddedDate = moment(release.date_added);

            if (releaseAddedDate.isBefore(lastUpdateDate)) {
                newReleaseID = release.id;
                break;
            }
        }

        return Promise.resolve(newReleaseID);
    }

    private async wasLastReleaseDeleted(userName: string, lastItemId: number): Promise<boolean> {
        const collectionItems: ReleasesResponseType = await this.discogsService.getCollectionItemByRelease(userName, lastItemId.toString());

        return collectionItems.releases.length === 0;
    }
}