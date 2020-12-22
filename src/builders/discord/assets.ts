import { MessageAttachment } from 'discord.js';

export class Assets {
	public staticAssets: MessageAttachment[] = [];

	buildStaticAssets(...msgAttachment: MessageAttachment[]): void {
		msgAttachment.forEach((attachment) => {
			this.addToAssets(attachment);
		});
	}

	private addToAssets(msgAttachment: MessageAttachment): void {
		const assetExists = this.staticAssets.some((asset) => asset.name === msgAttachment.name);
		if (!assetExists) {
			this.staticAssets.push(msgAttachment);
		}
	}
}
