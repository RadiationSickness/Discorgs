import * as https from 'https';
import { UserNotFoundResponse } from '../../builders/discogs/types/userResponseTypes';

export class DiscogsService {
    public signatureMethod = 'PLAINTEXT';
    public nonce = 'discorgs' as any;
    public headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Access-Control-Allow-Origin': '*',
      'User-Agent': "discorgs"
    };

    public async getUser(user: string): Promise<any> {
      const endPoint: string = `/users/${user}`;
      return await this.get(endPoint);
    }

    public async getWants(user: string): Promise<any> {
      const endPoint: string = `/users/${user}/wants`;
      return await this.get(endPoint);
    }

    public async getReleases(user: string): Promise<any> {
      const queryParams = '?sort=added&sort_order=desc';
      const endPoint: string = `/users/${user}/collection/folders/0/releases${queryParams}`;
      return await this.get(endPoint, true);
    }

    public async getCollectionFolders(user: string): Promise<any> {
      const endPoint: string = `/users/${user}/collection/folders`;
      return await this.get(endPoint);
    };

    public isErrorResponse(response: any): response is UserNotFoundResponse {
      return response.message !== undefined;
    }

    private get(endPoint: string, containsQueryParams: boolean = false): Promise<{}> {
      const authParams = `key=${process.env.DISCOGS_KEY}&secret=${process.env.DISCOGS_SECRET}`
      const concatCharacter: string = containsQueryParams ? '&' : '?';
      const options = {
        hostname: 'api.discogs.com',
        path: `${endPoint}${concatCharacter}${authParams}`,
        headers: this.headers,
      }
      
      return new Promise((resolve, reject) => {
        https.get(options, (response) => {
          let result = '';
          response.on('data', function (chunk) {
            result += chunk;
          });
      
          response.on('end', function () {
            return resolve(JSON.parse(result));   
          });  
        });
      });
    }
}
