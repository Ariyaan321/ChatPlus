
const Conversation = require('../models/conversation')
const Message = require('../models/message');
const User = require('../models/user');


async function getMessage(req, res) {
    try {
        console.log('IN GET MESSAGES HERE');
        const { senderUsername, receiverUsername } = req.body; // Only sender and receiver

        console.log('sender and receiver are: ', senderUsername + " : " + receiverUsername);

        // Sort the participants array to maintain a consistent order
        // When inserting in "conversation" model I am inserting sender first then receiver, does this mean I still have to sort ?
        const participants = [senderUsername, receiverUsername].sort();

        console.log('finding existing convo');
        // Find the conversation between the two participants
        let conversation = await Conversation.findOne({ participants: [participants[0], participants[1]] });
        console.log('found a convo and it is: ', conversation);

        // ------ IF they are friends and no convo, then print something in chat -> if(converssation === null)

        if (conversation === undefined || conversation == null) {
            console.log('in undefined');
            return res.status(200).json('!!');
        }

        // Fetch the list of messages from the conversation
        console.log('in listofnessages');
        const listOfMessages = await Message.find({
            '_id': { $in: conversation.messages }
        });

        // console.log('Returning list of messages to frontend:', listOfMessages);

        // Return the list of messages
        console.log('retuning here');
        res.status(200).json(listOfMessages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json("Some error occurred in reading message");
    }
}


async function handleSendMessage(senderUsername, receiverUsername, messageContent) {
    try {
        console.log('HERE IN HANDLE SEND MESSAGE');

        const sender = await User.findOne({ username: senderUsername });
        const receiver = await User.findOne({ username: receiverUsername });

        if (!sender || !receiver) {
            throw new Error("Sender or Receiver not found.");
        }

        const message = await Message.create({
            senderUsername: senderUsername,
            receiverUsername: receiverUsername,
            message: messageContent,
        });

        let conversation = await Conversation.findOne({
            participants: { $all: [senderUsername, receiverUsername] },
        });

        // if user decline request -> remove user from friends list & conversation
        const participantsS = [senderUsername, receiverUsername].sort();
        if (!conversation) {
            conversation = await Conversation.create({
                participants: participantsS,
                messages: [message._id],
            });
        } else {
            conversation.messages.push(message._id);
        }

        // Save the updated conversation
        await conversation.save();

        // returning the saved message
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
