const User = require('../models/user')


async function readAllUsers(req, res) {
    try {
        const users = await User.find(); // Get all users
        const senderUser = req.query.username;
        senderUserSchema = await User.findOne({ username: senderUser })
        friendsOfSenderUser = senderUserSchema.friends
        console.log('friendsOfSenderUser: \n');
        console.log(friendsOfSenderUser);
        friendsList = {} // changing to JSON Object
        exploreList = []
        let unreadUserCount = 0
        console.log('x is: \n');
        // users.forEach(async participant => {
        for (const participant of users) {
            console.log('in participant for: ------', participant.username);
            // console.log('part id: ', participant._id, "   ++    ", participant.username);
            if (participant.username != senderUser) {
                if (friendsOfSenderUser.includes(participant._id)) {
                    // check if participant have unread messages if in messageNotification
                    unreadUserCount = await inUnreadMessages(senderUser, participant.username)
                    console.log('after await is: ', unreadUserCount);
                    friendsList[participant.username] = unreadUserCount || 0;
                }
                else {
                    console.log('in explore here for: ', participant.username);
                    exploreList.push(participant.username)
                }
            }
        }
        console.log('friends: ', friendsList);
        console.log('explore: ', exploreList);
        // for (participant in users && participant.username !== senderUser) {
        //     console.log('firendArr and ExploreArr: ', "   ", friendsArr, "  ++++ ", exploreArr);
        // }
        console.log('forEach loop completed');
        res.status(200).json({
            friendsList,
            exploreList
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

async function createData(req, res) {
    try {
        console.log('in createData here');
        const userName = req.body.username
        if (await User.findOne({ username: userName })) {
            res.status(409).json("User name already exist's")
        }
        else {
            await User.create(req.body);
            res.status(201).send("User created successfully")
        }
    } catch (err) {
        console.log('error occured creating data is: ', err);
        res.status(500).json("Some error occured while creating user: ")
    }
}

async function connectionRequestSend(sender, receiver) {
    console.log('1: in connection request send');
    try {
        // we get friend that 'user' wants to connect with
        // Now that friend(user) requestList contains 'initial user'
        // fire socket to friend frontend when this complete
        const receiverUser = User.findOne({ username: receiver });
        if (!receiverUser) {
            return "receiver not found !"
        }
        else {
            await receiverUser.insertOne({
                request: {
                    username: receiver,
                    action: 1,
                }
            })
            return "request added in DB"
        }
    }
    catch (e) {
        console.log('Error occured in connection request: ', e.message);
        return "error";
    }
}

const inUnreadMessages = async (sender, receiver) => {
    console.log('in unread messages for: ', sender, ' && ', receiver);
    try {
        let found = await User.findOne({
            "username": sender,
            "messageNotification.username": receiver,
        });
        // [0] is not the right way , only targets index 0 !? no sense
        console.log('unread user for: ', found.username, ' - is: ', found.messageNotification[0].unreadcount);
        if (found.username) {
            console.log('in found.username here');
            return found.messageNotification[0].unreadcount;
        }
        else {
            console.log('in ELSE here');
            return 0;
        }
        // if yes: return found.unreadcount
        // else return 0        
    }
    catch (e) {
        console.log('error in unreadMessages: ', e.message);
        return 0;
    }
    // if (found) return true;
    // else return false;
}

const updateMessageNotification = async (sender, receiver, status) => {
    try {
        if (status === 0) {
            await User.updateOne(
                { username: sender },
                { $pull: { messageNotification: { username: receiver } } }
            );
            return "messageNotification deleted";
        }

        else {
            let found = await User.findOne({
                "username": receiver,
                "messageNotification.username": sender,
            });
            console.log('umn: found is: ', found);
            // [0] is not the right way , only targets index 0 !? no sense
            // console.log('umn user for: ', found.username, ' - is: ', found.messageNotification[0].unreadcount);
            if (found) {
                console.log('in found.username here');
                const index = found.messageNotification.findIndex(n => n.username === sender);
                if (index !== -1) {
                    console.log('in unm incrementor here');
                    found.messageNotification[index].unreadcount += 1;
                    await found.save();
                    console.log('sending unm repsonse now');
                    return "UPDATED MESSAGE NOTIFICATION 1";
                }
            }
            else {
                // If sender does NOT exist in messageNotification, add new entry
                await User.updateOne(
                    { username: receiver },
                    { $push: { messageNotification: { username: sender, unreadcount: 1 } } }
                );
                return "ADDED NEW MESSAGE NOTIFICATION 1";
            }
        }
    }
    catch (e) {
        console.log('error in updateMessNoti: ', e.message);
        return "Error occured in updateMessageNotification "
    }
}


module.exports = {
    readAllUsers,
    createData,
    updateMessageNotification,
    connectionRequestSend,
}
