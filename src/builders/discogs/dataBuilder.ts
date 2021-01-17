import { ReleaseEmbedMessageType, UserEmbedMessageType, WantsEmbedMessageType } from '../discord/discordTypes';
import { ReleasesArtistsType, ReleasesLabelsType, ReleasesType } from './types/releasesResponseTypes';
import { Nullable } from '../../universalTypes';
import { get } from 'lodash'
import { UserEmbedData } from './types/userResponseTypes';
import { WantsType } from './types/wantsResponseTypes';

export class DiscogsDataBuilder {
    private defaultColor: string = '#666666';

    public buildReleaseEmbedMessageData(discogsRelease: ReleasesType, userData: UserEmbedData): ReleaseEmbedMessageType {
        const baseUri: string = 'https://www.discogs.com/release/';
        const releaseId: string = get(discogsRelease, 'id', '').toString();

        return {
            color: process.env.DISCORD_COLLECTION_ADDITION_COLOR || this.defaultColor,
            title: get(discogsRelease, 'basic_information.title', ''),
            userImage: get(userData, 'userImage', ''),
            url: `${baseUri}${releaseId}`,
            mediaImage: get(discogsRelease, 'basic_information.cover_image', ''),
            userName: get(userData, 'userName', ''),
            artist: this.getArtistOrLabelNames(get(discogsRelease, 'basic_information.artists', null)) || 'none',
            labels: this.getArtistOrLabelNames(get(discogsRelease, 'basic_information.labels', null)) || 'none',
            genres: this.buildStringFromArray(get(discogsRelease, 'basic_information.genres', null)) || 'none',
            styles: this.buildStringFromArray(get(discogsRelease, 'basic_information.styles', null)) || 'none',
            year: get(discogsRelease, 'basic_information.year', 0),
        }
    }

    public buildWantsEmbedMessageData(discogsRelease: WantsType, userData: UserEmbedData): WantsEmbedMessageType {
        const baseUri: string = 'https://www.discogs.com/release/';
        const releaseId: string = get(discogsRelease, 'id', '').toString();

        const artist: string = this.getArtistOrLabelNames(get(discogsRelease, 'basic_information.artists', null)) || 'none';
        const title: string = get(discogsRelease, 'basic_information.title', '');
        const embedTitle = `${artist} - ${title}`;

        return {
            color: process.env.DISCORD_WANT_ADDITION_COLOR || this.defaultColor,
            title: embedTitle,
            userImage: get(userData, 'userImage', ''),
            url: `${baseUri}${releaseId}`,
            userName: get(userData, 'userName', ''),
            artist,
        }
    }

    public buildUserEmbedMessageData(
        userName: string,
        userImage?: string,
        profileUri?: string,
    ): UserEmbedMessageType {
        return {
            color: process.env.DISCORD_USER_ADDED_COLOR || this.defaultColor,
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