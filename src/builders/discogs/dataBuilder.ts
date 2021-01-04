import { ReleaseEmbedMessageType, UserEmbedMessageType } from '../discord/discordTypes';
import { ReleasesArtistsType, ReleasesLabelsType, ReleasesType } from './types/releasesResponseTypes';
import { Nullable } from '../../universalTypes';
import { get } from 'lodash'
import { UserResponseType } from './types/userResponseTypes';

export class DiscogsDataBuilder {
    private defaultColor: string = '#666666';

    public buildReleaseEmbedMessageData(discogsRelease: ReleasesType, userName: UserResponseType): ReleaseEmbedMessageType {
        return {
            color: process.env.DISCORD_MESSAGE_COLOR || this.defaultColor,
            title: get(discogsRelease, 'basic_information.title', ''),
            userImage: get(userName, 'avatar_url', ''),
            url: get(discogsRelease, 'basic_information.master_url', ''),
            mediaImage: get(discogsRelease, 'basic_information.cover_image', ''),
            userName: get(userName, 'username', ''),
            artist: this.getArtistOrLabelNames(get(discogsRelease, 'basic_information.artists', null)),
            labels: this.getArtistOrLabelNames(get(discogsRelease, 'basic_information.labels', null)),
            genres: this.buildStringFromArray(get(discogsRelease, 'basic_information.genres', null)),
            styles: this.buildStringFromArray(get(discogsRelease, 'basic_information.styles', null)),
            year: get(discogsRelease, 'basic_information.year', 0),
        }
    }

    public buildUserEmbedMessageData(
        userName: string,
        userImage?: string,
        profileUri?: string,
    ): UserEmbedMessageType {
        return {
            color: process.env.DISCORD_MESSAGE_COLOR || this.defaultColor,
            profileUri: profileUri || '',
            title: `${userName} successfully added!`,
            userImage: userImage || '',
            userName: userName,
        }
    }

    private buildStringFromArray(arrayOfString: Nullable<string[]>): string {
        return arrayOfString ? arrayOfString.join(', ') : '';
    }

    private getArtistOrLabelNames(arrayOfRecords: Nullable<ReleasesLabelsType[] | ReleasesArtistsType[]>): string {
        const arrayOfNames: string[] = [];

        if (arrayOfRecords && arrayOfRecords.length > 0) {
            arrayOfRecords.forEach((record: ReleasesArtistsType | ReleasesLabelsType) => {
                if (record.name) {
                    arrayOfNames.push(record.name);
                }
            });
        }

        return arrayOfNames.length > 0 ? arrayOfNames.join(', ') : '';
    }
}