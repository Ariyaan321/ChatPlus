
const Conversation = require('../models/conversation')
const Message = require('../models/message');
const User = require('../models/user'); // Assuming you have a User model


async function getMessage(req, res) {
    try {
        console.log('IN GET MESSAGES HERE');
        const { senderUsername, receiverUsername } = req.body;
        console.log('sender and reciever are: ', senderUsername + " : " + receiverUsername);

        let conversation = await Conversation.findOne({
            participants: { $all: [senderUsername, receiverUsername] },
        });

        // if not exist create one
        if (!conversation) {

            conversation = await Conversation.create({
                participants: [senderUsername, receiverUsername],
                messages: [],
            });

            await conversation.save();
        }

        // Add the message to the conversation || Store the message for chat history
        console.log('Trying to create listofmessages');
        // return the messages between participants to fronted and add in MessageList present in component/messages.js
        const listOfMessages = conversation.messages.map((message) => [
            message.senderUsername,
            message.receiverUsername,
            message.message,
        ])
        // console.log('---------- is : ', listO);
        // conversation.messages.forEach((message) => {
        //     // right now you are only pushing id's of individual messages
        //     console.log('message  :  ', message);
        //     listOfMessages.push(message);
        // })
        // listOfMessages.push(conversation.createdAt);
        // console.log('+++++++');

        console.log('RETURNING LISTOFMESSAGES TO FRONTEND: ', listOfMessages);
        // returning in this format: [ [sid, rid, msg] , [] , [] ,.. ]   ->  so that we can run map function on this
        res.status(200).json(listOfMessages);
    } catch {
        res.status(500).json("Some error occured in reading message")
    }
}

async function handleSendMessage(senderUsername, receiverUsername, messageContent) {
    try {
        console.log('HERE IN HANDLESENDMESSAGE');
        // Find sender and receiver IDs based on usernames
        const sender = await User.findOne({ Username: senderUsername });
        const receiver = await User.findOne({ Username: receiverUsername });

        if (!sender || !receiver) {
            throw new Error("Sender or Receiver not found.");
        }

        // Save the message to the Message collection
        const message = await Message.create({
            senderUsername: senderUsername,
            receiverUsername: receiverUsername,
            message: messageContent,
        });

        // Find or create a conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [senderUsername, receiverUsername] },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderUsername, receiverUsername],
                messages: [],
            });
        }

        // Add the message to the conversation || Store the message for chat history
        conversation.messages.push(message._id);
        await conversation.save();

        // console.log('conversation saved after saving is: ', conversation);
        // return saved message in DB
        return message;
    } catch (err) {
        console.error("Error in handleSendMessage:", err.message);
        throw err;
    }
}


module.exports = {
    getMessage,
    handleSendMessage,
    // updateMessage,
    // deleteMessage
}
