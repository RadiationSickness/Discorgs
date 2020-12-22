import { Client, Message, TextChannel } from "discord.js";
import { Nullable } from "../../universalTypes";
import { DiscordService } from "../discord/discrodService";
import { Commands } from "./commands";
import { messageCommands } from "./listenerTypes";

export class MessageListener {
    private discordClient: Client;
    private discordChannel: Nullable<TextChannel>;
    private botId: string;

    constructor(
        private discordService: DiscordService,
        private commands: Commands,
    ) {
        this.discordClient = this.discordService.getClient();
        this.discordChannel = this.discordService.getTextChannel();
        this.botId = process.env.DISCORD_BOT_ID || '';
    }

    public startMessageListener(): void {
        this.discordClient.on('message', (message: Message) => {
            if (this.discordChannel && this.messageContainsBotMention(message)) {
                message.member?.hasPermission('ADMINISTRATOR' || 'KICK_MEMBERS')
                    ? this.getCommand(message)
                    : this.discordChannel.send('You do not have permission to use Discorg commands.');
            }
        })
    }

    private getCommand(message: Message): void {
        const messageContent = message.content.toString();
        const userCommandString = messageContent.replace(`<@!${this.botId}>`, '').trim();

        const commandArray: string[] = Object.keys(messageCommands).filter((key) => {
            return (messageCommands[key].toLowerCase().indexOf(userCommandString.toLowerCase()) > -1) || (userCommandString.toLowerCase().indexOf(messageCommands[key].toLowerCase()) > -1);
        });

        if (commandArray && commandArray.length === 1) {
            const commandMethod: keyof Commands = commandArray[0] as keyof Commands;
            const commandParam: Nullable<string> = userCommandString.replace(messageCommands[commandArray[0]], '').trim();

            if (commandMethod) {
                this.commands[commandMethod](commandParam);
            }

            return;
        }

        this.discordChannel?.send('Command not found! `@Discorgs help` will list valid commands.');
    }

    private messageContainsBotMention(message: Message): boolean {
        let mentionMatchesBot: boolean = false;

        if (message.mentions && message.mentions.members) {
            const mentionId = message.mentions.members.first()?.id.toString();
            mentionMatchesBot = mentionId === this.botId;
        }
        
        return mentionMatchesBot;
    }
}
