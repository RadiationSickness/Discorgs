import { MessageEmbed, MessageAttachment } from 'discord.js';
import { ReleaseEmbedMessageType, UserEmbedMessageType, WantsEmbedMessageType } from './discordTypes';
import { Assets } from '../../builders/discord/assets';

export class DiscordDataBuilder {
	public staticAssets: MessageAttachment[] = [];

	constructor() {
		const assets = new Assets();
		assets.buildStaticAssets(
			new MessageAttachment('./src/assets/discogsIcon.png', 'discogsIcon.png'),
			new MessageAttachment('./src/assets/discorgIcon.jpg', 'discorgIcon.jpg')
		);
		this.staticAssets = [...assets.staticAssets];
    }
    
    public buildUserEmbedMessage(params: UserEmbedMessageType): MessageEmbed {
        return new MessageEmbed()
            .setColor(params.color)
            .setTitle(params.title)
            .setURL(params.profileUri)
            .setAuthor('Discorgs', 'attachment://discorgIcon.jpg')
            .setThumbnail(params.userImage)
            .setTimestamp();
    }

    public buildReleaseEmbedMessage(params: ReleaseEmbedMessageType, collectionUpdate: boolean = true): MessageEmbed {
        const embed: MessageEmbed = new MessageEmbed()
            .setColor(params.color)
            .setTitle(params.title)
            .attachFiles(this.staticAssets)
            .setURL(params.url)
            .setAuthor('Discorgs', 'attachment://discorgIcon.jpg')
            .setThumbnail(params.userImage);

        if (collectionUpdate) {
            embed.addFields({ name: 'Collection Update', value: `${params.userName} added ${params.title} by ${params.artist} to their collection!`});
        } else {
            embed.addFields({ name: 'Release', value: `${params.userName} has ${params.title} by ${params.artist} as apart of their collection!`});
        }
        
        embed.addFields(
            { name: 'Artist', value: params.artist, inline: true },
            { name: 'Year', value: params.year.toString(), inline: true },
            { name: 'Label', value: params.labels, inline: true },
            { name: 'Genres', value: params.genres, inline: true },
            { name: 'Styles', value: params.styles, inline: true },
        );
        embed.setImage(params.mediaImage);
        embed.setTimestamp();
        embed.setFooter('Dircorgs thinks you should buy more records', 'attachment://discogsIcon.png');

        return embed;
    }

    public buildWantEmbedMessage(params: WantsEmbedMessageType, wantsUpdate: boolean = true): MessageEmbed {
        const embed: MessageEmbed = new MessageEmbed()
            .setColor(params.color)
            .setTitle(params.title)
            .attachFiles(this.staticAssets)
            .setURL(params.url)
            .setAuthor('Discorgs', 'attachment://discorgIcon.jpg')
            .setThumbnail(params.userImage);

        if (wantsUpdate) {
            embed.setDescription(`${params.userName} added ${params.title} by ${params.artist} to their want list!`);
        } else {
            embed.setDescription(`${params.userName} wants ${params.title} by ${params.artist}!`);
        }
        
        embed.setTimestamp();
        embed.setFooter('Dircorgs thinks you should buy more records', 'attachment://discogsIcon.png');

        return embed;
    }
}
