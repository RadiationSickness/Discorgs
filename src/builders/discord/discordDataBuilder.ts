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

    public buildEmbedMessage(params: EmbedMessageType, collectionUpdate: boolean = false): MessageEmbed {
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

    private buildStaticAssets(): void {
        this.staticAssets.push(new MessageAttachment('./src/assets/discogsIcon.png', 'discogsIcon.png'));
        this.staticAssets.push(new MessageAttachment('./src/assets/discorgIcon.jpg', 'discorgIcon.jpg'));
    }
}
>>>>>>> Stashed changes
