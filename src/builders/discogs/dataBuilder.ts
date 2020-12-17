import { EmbedMessageType } from '../discord/discordTypes';
import { ReleasesType } from './types/releasesResponseTypes';
import { Nullable } from '../../universalTypes';
import { get } from 'lodash'
import { UserResponseType } from './types/userResponseTypes';

export class DiscogsDataBuilder {
    public buildReleaseEmbedMessageData(discogsRelease: ReleasesType, userName: UserResponseType): EmbedMessageType {
        const defaultColor: string = '#666666';
        
        return {
            color: process.env.DISCORD_MESSAGE_COLOR || defaultColor,
            title: get(discogsRelease, 'username.basic_information.title', ''),
            userImage: get(discogsRelease, 'username.basic_information.cover_image', ''),
            url: get(discogsRelease, 'username.basic_information.cover_image', 'master_url'),
            thumbnailUrl: get(userName, 'avatar_url:', ''),
            userName: get(userName, 'username', ''),
            artist: [{foo: 'bar'}], // @TODO: How will I display/format this?
            labels: [{foo: 'bar'}], // @TODO: How will I display/format this?
            genres: this.arrayToString(get(discogsRelease, 'basic_information.genres', null)),
            styles: this.arrayToString(get(discogsRelease, 'basic_information.styles', null)),
            year: get(discogsRelease, 'basic_information.year', 0),
        }
    }

    private arrayToString(arrayOfString: Nullable<string[]>): string {
        return arrayOfString ? arrayOfString.join(', ') : '';
    }
}