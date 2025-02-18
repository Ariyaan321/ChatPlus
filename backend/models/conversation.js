const mongoose = require('mongoose')
const { Schema } = mongoose;

const conversationSchema = new Schema(
    {
        participants: [
            {
                type: String,
                required: true,
                default: [],
            },
        ],
        messages: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Message',
                default: [],
                required: true,
            },
        ]
    }, { timestamps: true }
);

const Conversation = mongoose.model('Conversation', conversationSchema)
module.exports = Conversation