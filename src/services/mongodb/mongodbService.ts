import { Connection, Mongoose, Document } from 'mongoose';
import { Nullable } from '../../universalTypes';
import { userSchema } from './models/users';

export class MongodbService {
    private mongoose: Mongoose;
    private dbConnection: Connection | undefined;

    constructor() {
        this.mongoose = new Mongoose;
        this.mongoose.set('bufferCommands', false);
        this.initiate();
    }

    public async initiate(): Promise<void> {
        this.dbConnection = await this.connect();

        if (this.dbConnection && this.dbConnection.readyState === 1) {
            console.log('Connected to DB!');
            await this.disconnect();
        }
    }

    public async saveUser(discordUserName: string, discogsUserName: string): Promise<void> {
        if (!this.dbConnection || this.dbConnection.readyState !== 1) {
            this.dbConnection = await this.connect();
        }

        const User = this.dbConnection.model('User', userSchema);
        const user = new User({ _id: discordUserName, discogsUserName: discogsUserName });

        try {
            await User.create(user);
        } catch (err) {
            console.error('Error while saving user!', err);
        }

        return Promise.resolve();
    }

    public async getUserByKeyValue(key: string, value: string): Promise<Document[] | null> {
        if (!this.dbConnection || this.dbConnection.readyState !== 1) {
            this.dbConnection = await this.connect();
        }

        let response: Nullable<Document[]> = null;
        const User = this.dbConnection.model('User', userSchema);

        try {
            response = await User.find({[key]: value});
        } catch (err) {
            console.error('Error while retrieving users!', err);
        }

        return Promise.resolve(response);
    }

    public async getUserByID(userName :string): Promise<Document | null> {
        if (!this.dbConnection || this.dbConnection.readyState !== 1) {
            this.dbConnection = await this.connect();
        }

        let response: Nullable<Document> = null;
        const User = this.dbConnection.model('User', userSchema);

        try {
            response = await User.findById(userName);
        } catch (err) {
            console.error('Error while retrieving users!', err);
        }

        return Promise.resolve(response);
    }

    private async connect(): Promise<Connection> {
        const connection: Connection = await this.mongoose.createConnection(
            'mongodb://mongodb:27017/test',
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                reconnectTries: 3,
                serverSelectionTimeoutMS: 5000,
            },
        );

        if (connection.readyState !== 1) {
            return Promise.reject(new Error('Failed to connect to DB instance!'));
        }

        return Promise.resolve(connection);
    }

    private async disconnect(): Promise<void> {
        if (this.dbConnection) {
            await this.dbConnection.close();
        }
    }
}