import { MessageEmbed, MessageAttachment } from 'discord.js';
import { EmbedMessageType } from './discordTypes';
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

	public buildEmbedMessage(params: EmbedMessageType): MessageEmbed {
		return new MessageEmbed()
			.setColor(params.color)
			.setTitle(params.title)
			.attachFiles(this.staticAssets)
			.setURL(params.url)
			.setAuthor('Discorgs', 'attachment://discorgIcon.jpg')
			.setThumbnail(params.userImage)
			.addFields(
				{
					name: 'Collection Update',
					value: `${params.userName} added ${params.title} by ${params.artist} to their collection!`,
				},
				{ name: 'Artist', value: params.artist, inline: true },
				{ name: 'Year', value: params.year.toString(), inline: true },
				{ name: 'Label', value: params.labels, inline: true },
				{ name: 'Genres', value: params.genres, inline: true },
				{ name: 'Styles', value: params.styles, inline: true }
			)
			.setImage(params.mediaImage)
			.setTimestamp()
			.setFooter('Dircorgs thinks you should buy more records', 'attachment://discogsIcon.png');
	}
}
