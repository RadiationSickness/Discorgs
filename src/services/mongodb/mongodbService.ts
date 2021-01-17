import { Connection, Mongoose, Document } from 'mongoose';
import { Nullable } from '../../universalTypes';
import { userSchema } from './models/users';

export class MongodbService {
    private mongoose: Mongoose;
    private userLimit: number = 250;

    constructor() {
        this.mongoose = new Mongoose;
        this.mongoose.set('bufferCommands', false);
        this.mongoose.set('debug', false);
        this.initiate();
    }

    public async initiate(): Promise<void> {
        const dbConnection = await this.connect();

        if (dbConnection && dbConnection.readyState === 1) {
            console.log('Connected to DB!');
            await dbConnection.close();
        }
    }

    public async saveUser(
        discordUserName: string,
        discogsUserName: string,
        discogsUserImage?: string,
        discordUserProfileUri?: string,
        lastCollectionItemId?: number,
        lastWantListItemId?: number,
    ): Promise<void> {
        const dbConnection = await this.connect();
        const userCount: number = await this.getUserCount();

        if (userCount >= this.userLimit) {
            await dbConnection.close();
            return Promise.resolve();
        }

        const User = dbConnection.model('User', userSchema);
        const user = new User({
            _id: discordUserName,
            discogsUserName,
            discogsUserImage,
            discordUserProfileUri,
            lastCollectionItemId,
            lastWantListItemId,
        });

        try {
            await User.create(user);
        } catch (err) {
            console.error('Error while saving user!', err);
        }

        await dbConnection.close();
        return Promise.resolve();
    }

    public async getUserByKeyValue(key: string, value: string): Promise<Document[] | null> {
        const dbConnection = await this.connect();

        let response: Nullable<Document[]> = null;
        const User = dbConnection.model('User', userSchema);

        try {
            response = await User.find({[key]: value});
        } catch (err) {
            console.error('Error while retrieving users!', err);
        }

        await dbConnection.close();
        return Promise.resolve(response);
    }

    public async getUserByID(userName: string): Promise<Nullable<Document>> {
        const dbConnection = await this.connect();

        let response: Nullable<Document> = null;
        const User = dbConnection.model('User', userSchema);

        try {
            response = await User.findById(userName);
        } catch (err) {
            console.error('Error while retrieving users!', err);
        }

        await dbConnection.close();
        return Promise.resolve(response);
    }

    public async getAllUserIDs(): Promise<string[]> {
        const idArray: string[] = [];
        const dbConnection = await this.connect();
        const User = dbConnection.model('User', userSchema);

        try {
            await User.find({}, async (err, users) => {
                if (err) {
                    console.error('Error while retrieving all users!', err);
                    await dbConnection.close();
                    return Promise.resolve(idArray);
                }

                if (users && users.length > 0) {
                    users.forEach((user) => {
                        idArray.push(user._id);
                    });
                }
            });
        } catch (err) {
            console.error('Error while retrieving all users!', err);
        }

        await dbConnection.close();
        return Promise.resolve(idArray);
    }

    public async updateUserAttribute(userName: string, attribute: string, value: string|number): Promise<void> {
        const dbConnection = await this.connect();

        const User = dbConnection.model('User', userSchema);
        const user: Nullable<Document> = await User.findOne({_id: userName});

        if (user) {
            try {
                await user.updateOne({ '$set': { [attribute]: value }});
            } catch (err) {
                console.error(`Error while updating attribute ${attribute} for user ${userName}!`, err);
            }    
        }

        await dbConnection.close();
    }

    public async removeUser(userName: string): Promise<void> {
        const dbConnection = await this.connect();
        const User = dbConnection.model('User', userSchema);

        try {
            await User.findByIdAndRemove(userName);
        } catch (err) {
            console.error(`Error while removing entery with id: ${userName}!`, err);
        }

        await dbConnection.close();
    }

    public async getUserCount(): Promise<number> {
        const errMessage: string = 'Error while retrieving user count!';
        let userCount: number = 0;
        const dbConnection = await this.connect();
        const User = dbConnection.model('User', userSchema);

        try {
            await User.countDocuments({}, async (err, count) => {
                if (err) {
                    console.error(errMessage, err);
                    await dbConnection.close();
                    return Promise.resolve(userCount);
                }
                userCount = count;
            });
        } catch (err) {
            console.error(errMessage, err);
        }

        await dbConnection.close();
        return Promise.resolve(userCount);
    }

    public async getRandomUser(): Promise<Nullable<Document>> {
        let user: Nullable<Document> = null;
        const dbConnection = await this.connect();
        const User = dbConnection.model('User', userSchema);

        try {
            await User.countDocuments({}, async (err, count) => {
                const random = Math.floor(Math.random() * count);

                User.findOne().skip(random).exec(async (err, result) => {
                    if (err) {
                        console.error(`Error while retrieving ranom user!`, err);
                        await dbConnection.close();
                        return Promise.resolve(user);
                    }

                    user = result;
                });
            });
        } catch (err) {
            console.error(`Error while retrieving ranom user!`, err);
        }

        await dbConnection.close();
        return Promise.resolve(user);
    }

    private async connect(): Promise<Connection> {
        const connection: Connection = await this.mongoose.createConnection(
            'mongodb://mongodb:27017/test',
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
                serverSelectionTimeoutMS: 5000,
            },
        );

        if (connection.readyState !== 1) {
            return Promise.reject(new Error('Failed to connect to DB instance!'));
        }

        return Promise.resolve(connection);
    }
}