
import { TextChannel, MessageEmbed } from 'discord.js';
import { DiscogsService } from '../discogs/discogsService';
import { DiscordService } from '../discord/discrodService';
import { Nullable } from '../../universalTypes';
import { ReleasesResponseType, ReleasesType } from '../../builders/discogs/types/releasesResponseTypes';
import { UserNotFoundResponse, UserResponseType } from '../../builders/discogs/types/userResponseTypes';
import { DiscogsDataBuilder } from '../../builders/discogs/dataBuilder';
import { EmbedMessageType } from '../../builders/discord/discordTypes';
import { DiscordDataBuilder } from '../../builders/discord/discordDataBuilder';
import { messageCommands } from './listenerTypes';

export class Commands {
    private users: string[] = [];
    private discordChannel: Nullable<TextChannel>;
    private discogsDataBuilder: DiscogsDataBuilder;
    private discordDataBuilder: DiscordDataBuilder;

	constructor(
        private discogsService: DiscogsService,
        private discordService: DiscordService,
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

    public async addDiscogsUser(params?: string): Promise<void> {
        if (params) {
            if (this.users.includes(params)) {
                this.discordChannel?.send('User is already registered!');
                return;
            }

            const user: UserResponseType | UserNotFoundResponse = await this.discogsService.getUser(params);
            if (user && this.discogsService.isErrorResponse(user)) {
                this.discordChannel?.send(`User ${params} is not a valid Discogs user!`);
                return;
            }

            this.users.push(params);
            const newMessage: string = `Added user ${params}`;
            this.discordChannel?.send(newMessage);
        }
    }

	public getDiscogsUsers(params?: string): void {
		const messageBase = 'The following users are currently registered:\n';
		const listIcon = ':loud_sound:';
		const listLimit = 5;
		let userCount = 0;
		let newMessage: string = messageBase;

		while (userCount < listLimit && userCount < this.users.length) {
			newMessage = newMessage.concat(`   ${listIcon}  ${this.users[userCount]}\n`);
			userCount++;
		}

        if (userCount === listLimit) {
            const remainingUserCount = this.users.length - listLimit;
            if (remainingUserCount === 1) {
                newMessage = newMessage.concat(`Plus ${remainingUserCount} other...`);
            } else if (remainingUserCount > 1) {
                newMessage = newMessage.concat(`Plus ${remainingUserCount} others...`);
            }
        }

		if (newMessage === messageBase) {
			newMessage = 'There are no users currently registered!';
		}

		this.discordChannel?.send(newMessage);
	}

    public searchRegisteredUsers(params?: string): void {
        if (params && this.users.includes(params)) {
            this.discordChannel?.send('User is registered.');
            return;
        }

        this.discordChannel?.send('User is not currently registered!');
    }

    public removeDiscogsUser(params?: string): void {
        if (params && this.users.includes(params)) {
            const userIndex: number = this.users.indexOf(params);
            if (userIndex > -1) {
                this.users.splice(userIndex, 1);
            }
            this.discordChannel?.send('User removed successfully.');

            return;
        }

        this.discordChannel?.send('User is not currently registered!');
    }

    public async getLatestAdditionToCollection(params?: string): Promise<void> {
        if (params && this.users.includes(params)) {
            const collectionResponse: ReleasesResponseType = await this.discogsService.getReleases(params);
            const user: UserResponseType = await this.discogsService.getUser(params); // @TODO: store user data on add to avoid unnecessary api call

            const embedMessage: EmbedMessageType = this.discogsDataBuilder.buildReleaseEmbedMessageData(collectionResponse.releases[0], user);
            const embed: MessageEmbed = this.discordDataBuilder.buildEmbedMessage(embedMessage, false);
            this.discordService.sendEmbed(embed);
        }
    }

    public async getRandomRelease(params?: string): Promise<void> {
        const user: string = this.users[Math.floor(Math.random() * this.users.length)];
        const collectionResponse: ReleasesResponseType = await this.discogsService.getReleases(user);
        const discogsUser: UserResponseType = await this.discogsService.getUser(user); // @TODO: store user data on add to avoid unnecessary api call
       
        if (collectionResponse && collectionResponse.releases && collectionResponse.releases.length > 0) {
            const releaseCollection: ReleasesType[] = collectionResponse.releases;
            const randomRelease: ReleasesType = releaseCollection[Math.floor(Math.random() * releaseCollection.length)];

            const embedMessage: EmbedMessageType = this.discogsDataBuilder.buildReleaseEmbedMessageData(randomRelease, discogsUser);
            const embed: MessageEmbed = this.discordDataBuilder.buildEmbedMessage(embedMessage, false);
            this.discordService.sendEmbed(embed);
        }
    }
}
