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
        console.log('error in unreadMessages: ', e);
        return 0;
    }
    // if (found) return true;
    // else return false;
}


module.exports = {
    readAllUsers,
    createData,
    inUnreadMessages
}
