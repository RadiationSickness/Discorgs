import { Schema } from "mongoose";

export const userSchema: Schema = new Schema({
    _id: {
        type: String,
    },
    discogsUserName: {
        type: String,
        unique: true,
        required: true,
    },
    discogsUserImage: {
        type: String,
        required: false,
    },
    discordUserProfileUri: {
        type: String,
        required: false,
    },
    lastCollectionItemId: {
        type: Number,
        required: false,
    },
    lastWantListItemId: {
        type: Number,
        required: false, 
    },
}, { timestamps: true, versionKey: false });
