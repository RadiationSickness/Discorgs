import { TextChannel, Message, Client, Emoji } from 'discord.js';
import { DiscogsService } from '../discogs/discogsService';
import { DiscordService } from '../discord/discrodService';
import { messageCommands } from "./listenerTypes";
import { Nullable } from '../../universalTypes';

export class Commands {
    private users: string[] = ['foo', 'bar', 'foobar', 'test', 'test1', 'test2'];
    private discordClient: Client;
    private discordChannel: Nullable<TextChannel>;
    private musicNoteEmoji: Emoji | undefined;

    constructor(
        private discogsService: DiscogsService,
        private discordService: DiscordService,
    ) {
        this.discordClient = this.discordService.getClient();
        this.discordChannel = this.discordService.getTextChannel();
    }

    public getHelp(params?: string): void {
        let newMessage: string = '';

        for (let key in messageCommands) {
            newMessage = newMessage.concat(`- @Discorgs ${messageCommands[key]}\n`);
        }

        this.discordChannel?.send(newMessage);
    }

    public addDiscogsUser(params?: string): void {
        if (params) {
            if (this.users.includes(params)) {
                this.discordChannel?.send('User is already registered.');
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
            newMessage = newMessage.concat(`   ${listIcon}  ${this.users[userCount]}\n`)
            userCount++;
        }

        if (userCount === listLimit) {
            const remainingUserCount = this.users.length - listLimit;
            newMessage = remainingUserCount === 1
                ? newMessage.concat(`Plus ${remainingUserCount} other...`)
                : newMessage.concat(`Plus ${remainingUserCount} others...`);
        }

        if (newMessage === messageBase) {
            newMessage = 'There are no users currently registered!'
        }

        this.discordChannel?.send(newMessage);
    }

    public isUserRegistered(params?: string): void {
        //@TODO: Build out
    }

    public removeDiscogsUser(params?: string): void {
        //@TODO: Build out
    }

    public getColletionValue(params?: string): void {
        //@TODO: Build out
    }
}