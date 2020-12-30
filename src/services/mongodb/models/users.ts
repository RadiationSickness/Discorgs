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
    lastCollectionItem: {
        type: Number,
        required: false,
    },
    lastWantListItem: {
        type: Number,
        required: false, 
    }
}, { timestamps: true });
