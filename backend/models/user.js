const mongoose = require('mongoose')
const { Schema } = mongoose;

const userSchema = new Schema(
    {
        Username: {
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
        ]
    }, { timestamps: true }
);

const User = mongoose.model('User', userSchema)
module.exports = User