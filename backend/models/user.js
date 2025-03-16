const mongoose = require('mongoose')
const { Schema } = mongoose;

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        profilePic: {
            type: String,
            default: "",
        },
        friends: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                default: [],
                required: true,
            },
        ],
        request: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                default: [],
                required: true
            }
        ],
        messageNotification: [
            {
                username: { type: String, required: true },
                unreadcount: { type: Number, default: 0, required: true },
            }
        ],
    }, { timestamps: true }
);

const User = mongoose.model('User', userSchema)
module.exports = User