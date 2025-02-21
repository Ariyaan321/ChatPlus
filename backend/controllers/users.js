const User = require('../models/user')


async function readAllUsers(req, res) {
    try {
        const users = await User.find(); // Get all users
        const senderUser = req.query.username;
        senderUserSchema = await User.findOne({ Username: senderUser })
        friendsOfSenderUser = senderUserSchema.friends
        console.log('friendsOfSenderUser: \n');
        console.log(friendsOfSenderUser);
        friendsList = []
        exploreList = []
        console.log('x is: \n');
        users.forEach(participant => {
            // console.log('part id: ', participant._id, "   ++    ", participant.Username);
            if (participant.Username != senderUser) {
                if (friendsOfSenderUser.includes(participant._id)) {
                    friendsList.push(participant.Username)
                }
                else {
                    exploreList.push(participant.Username)
                }
            }
        })
        console.log('friends: ', friendsList);
        console.log('explore: ', exploreList);
        // for (participant in users && participant.Username !== senderUser) {
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
        const userName = req.body.Username
        if (await User.findOne({ Username: userName })) {
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

module.exports = {
    readAllUsers,
    createData,
}
