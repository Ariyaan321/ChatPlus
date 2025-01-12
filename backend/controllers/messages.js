const Message = require('../models/message')
const Conversation = require('../models/conversation')

async function getMessage(req, res) {
    try {
        const message = await Message.find({})
        res.status(200).json(message)
    } catch {
        res.status(500).json("Some error occured in reading message")
    }
}

async function sendMessage(req, res) {
    console.log('in send message function here');
    // from req.body we get "sender_id, receiver_id and message"  ->   Look at conversations model and find these two , if not found create one  -> append in  new message _id in conversations.message array  ->  use socket here

    try {
        const { receiverId, senderId, message } = req.body;

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        })

        if (!conversation) {
            conversation = new Conversation(
                {
                    participants: [senderId, receiverId],
                    messages: [],
                }
            )
            await conversation.save();
        }

        const newMessage = new Message(
            {
                senderId: senderId,
                receiverId: receiverId,
                message: message
            }
        )
        await newMessage.save();

        conversation.messages.push(newMessage._id);
        await conversation.save();


        res.status(201).json("Message send successfully!")
    } catch (e) {
        console.log('error while sending message: ', e.message);
        res.status(500).json("An error occured while sending message")
    }
}

module.exports = {
    getMessage,
    sendMessage,
    // updateData,
    // deleteData
}