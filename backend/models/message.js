const mongoose = require('mongoose')
const { Schema } = mongoose;

const messageSchema = new Schema(
    {
        senderUsername: {
            // type: mongoose.Schema.Types.ObjectId,
            type: String,
            ref: "User",
            required: true
        },
        receiverUsername: {
            type: String,
            ref: "User",
            required: true
        },
        message: {
            type: String,
            required: true
        }
    }, { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema)
module.exports = Message