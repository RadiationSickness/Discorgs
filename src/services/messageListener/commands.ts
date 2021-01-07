
import { TextChannel, MessageEmbed } from 'discord.js';
import { DiscogsService } from '../discogs/discogsService';
import { DiscordService } from '../discord/discrodService';
import { Nullable } from '../../universalTypes';
import { ReleasesResponseType, ReleasesType } from '../../builders/discogs/types/releasesResponseTypes';
import { UserEmbedData, UserNotFoundResponse, UserResponseType } from '../../builders/discogs/types/userResponseTypes';
import { DiscogsDataBuilder } from '../../builders/discogs/dataBuilder';
import { ReleaseEmbedMessageType, UserEmbedMessageType } from '../../builders/discord/discordTypes';
import { DiscordDataBuilder } from '../../builders/discord/discordDataBuilder';
import { messageCommands } from './listenerTypes';
import { MongodbService } from '../mongodb/mongodbService';
import { Document } from 'mongoose';
import { WantsResponseType } from '../../builders/discogs/types/wantsResponseTypes';


export class Commands {
    private discordChannel: Nullable<TextChannel>;
    private discogsDataBuilder: DiscogsDataBuilder;
    private discordDataBuilder: DiscordDataBuilder;
    private userLimit: number = 500;

	constructor(
        private discogsService: DiscogsService,
        private discordService: DiscordService,
        private dbService: MongodbService,
    ) {
        this.discordChannel = this.discordService.getTextChannel();
        this.discogsDataBuilder = new DiscogsDataBuilder();
        this.discordDataBuilder = new DiscordDataBuilder();
	}

    public getHelp(params?: string): void {
        let newMessage: string = '';

        for (let key in messageCommands) {
            newMessage = newMessage.concat(`- @Discorgs ${messageCommands[key]}\n`);
        }

        this.discordChannel?.send(newMessage);
    }

    public async addUser(params?: string): Promise<void> {
        if (params && params.split(',').length === 2) {
            const paramArray: string[] = params.split(',');
            const discordUserName: string = paramArray[0].trim();
            const discogsUserName: string = paramArray[1].trim();

            if (!discordUserName || !discogsUserName) {
                this.discordChannel?.send('Invalid parameters sent. Use the "help" command to list all commands with expected params.');
                return;
            }

            const userId: Nullable<string> = this.discordService.getUserIdByName(discordUserName);
            if (!userId) {
                this.discordChannel?.send(`No Discord user found with username: ${discordUserName}`);
                return;
            }

            const dbUser: Nullable<Document> = await this.dbService.getUserByID(userId);
            if (dbUser) {
                this.discordChannel?.send('User is already registered!');
                return;
            }

            const userCount: number = await this.dbService.getUserCount();
            if (userCount >= this.userLimit) {
                this.discordChannel?.send('Maximum registered users reached! Please remove clean out old users if you wish to add more.');
                return;
            }

            const discogUser: UserResponseType | UserNotFoundResponse = await this.discogsService.getUser(discogsUserName);
            if (discogUser && this.discogsService.isErrorResponse(discogUser)) {
                this.discordChannel?.send(`User ${discogsUserName} is not a valid Discogs user!`);
                return;
            }

            this.discordChannel?.send('Retrieving data...');

            const discordUserImage: string | undefined = discogUser.avatar_url || undefined;
            const discordUserProfileUri: string | undefined = discogUser.uri || undefined;
            const releaseResponse: ReleasesResponseType = await this.discogsService.getReleases(discogsUserName);
            let releaseId: number | undefined;
            if (releaseResponse && releaseResponse.releases.length > 0) {
                releaseId = releaseResponse.releases[0].id;
            }

            const wantsResponse: WantsResponseType = await this.discogsService.getWants(discogsUserName);
            let wantsId: number | undefined;
            if (wantsResponse && wantsResponse.wants.length > 0) {
                wantsId = wantsResponse.wants[0].id;
            }

            await this.dbService.saveUser(
                userId,
                discogsUserName,
                discordUserImage,
                discordUserProfileUri,
                releaseId,
                wantsId,
            );

            const embedParams: UserEmbedMessageType = this.discogsDataBuilder.buildUserEmbedMessageData(
                discogsUserName,
                discordUserImage,
                discordUserProfileUri,
            );
            const embedMessage: MessageEmbed = this.discordDataBuilder.buildUserEmbedMessage(embedParams);

            this.discordService.sendEmbed(embedMessage);
            return;
        }

        this.discordChannel?.send('Invalid parameters sent. Use the "help" command to list all commands with expected params.');
    }

    public async searchRegisteredUsers(params?: string): Promise<void> {
        const discordUserName: string = params || '';
        const userId: Nullable<string> = this.discordService.getUserIdByName(discordUserName);
        if (!userId) {
            this.discordChannel?.send(`No Discord user found with username: ${discordUserName}`);
            return;
        }

        const dbUser: Nullable<Document> = await this.dbService.getUserByID(userId);
        if (dbUser) {
            this.discordChannel?.send('User is already registered!');
            return;
        }

        this.discordChannel?.send('User is not currently registered!');
    }

    public async removeUser(params?: string): Promise<void> {
        const discordUserName: string = params || '';
        const userId: Nullable<string> = this.discordService.getUserIdByName(discordUserName);
        if (!userId) {
            this.discordChannel?.send(`No Discord user found with username: ${discordUserName}`);
            return;
        }

        const dbUser: Nullable<Document> = await this.dbService.getUserByID(userId);
        if (!dbUser) {
            this.discordChannel?.send('User is not currently registered!');
            return;
        }

        await this.dbService.removeUser(userId);
        this.discordChannel?.send('User removed successfully!');
    }

    public async getLatestAdditionToCollection(params?: string): Promise<void> {
        const user: Nullable<Document> = await this.dbService.getRandomUser() as any;
        if (!user) {
            this.discordChannel?.send('No users currently registered!');
            return;
        }

        const userObj = user.toObject({ getters: true, virtuals: false }) as any;
        if (!userObj.discogsUserName) {
            this.discordChannel?.send(`User with ID: ${userObj._id} has not assocaited Discord username!`);
            return;
        }

        const discogsUser: UserEmbedData = {
            userName: userObj.discogsUserImage,
            userImage: userObj.discogsUserName,
        };
        const collectionResponse: ReleasesResponseType = await this.discogsService.getReleases(userObj.discogsUserName);
        const embedMessage: ReleaseEmbedMessageType = this.discogsDataBuilder.buildReleaseEmbedMessageData(collectionResponse.releases[0], discogsUser);
        const embed: MessageEmbed = this.discordDataBuilder.buildReleaseEmbedMessage(embedMessage, false);
        this.discordService.sendEmbed(embed);
    }

    // @TODO: updated to get random page from release, currently is only random to the top 50 recently added releases
    public async getRandomRelease(params?: string): Promise<void> {
        const user: Nullable<Document> = await this.dbService.getRandomUser() as any;
        if (!user) {
            this.discordChannel?.send('No users currently registered!');
            return;
        }

        const userObj = user.toObject({ getters: true, virtuals: false }) as any;
        if (!userObj.discogsUserName) {
            this.discordChannel?.send(`User with ID: ${userObj._id} has not assocaited Discord username!`);
            return;
        }

        const collectionResponse: ReleasesResponseType = await this.discogsService.getReleases(userObj.discogsUserName);
        if (collectionResponse && collectionResponse.releases && collectionResponse.releases.length > 0) {
            const releaseCollection: ReleasesType[] = collectionResponse.releases;
            const randomRelease: ReleasesType = releaseCollection[Math.floor(Math.random() * releaseCollection.length)];
            const discogsUser: UserEmbedData = {
                userName: userObj.discogsUserImage,
                userImage: userObj.discogsUserName,
            };

            const embedMessage: ReleaseEmbedMessageType = this.discogsDataBuilder.buildReleaseEmbedMessageData(randomRelease, discogsUser);
            const embed: MessageEmbed = this.discordDataBuilder.buildReleaseEmbedMessage(embedMessage, false);
            this.discordService.sendEmbed(embed);
        }
    }
}
