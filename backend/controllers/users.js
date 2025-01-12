const User = require('../models/user')


// Assuming you have a simple 'User' model
async function readAllUsers(req, res) {
    try {
        const users = await User.find(); // Get all users
        console.log('backend: all users: ', users);
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

async function createData(req, res) {
    try {
        const userName = req.body.Username
        if (await User.findOne({ Username: userName })) {
            res.status(409).json("User name already exist's")
        }
        else {
            await User.create(req.body).save();
            res.status(201).send("User created successfully")
        }
    } catch {
        res.status(500).json("Some error occured while creating user")
    }
}

module.exports = {
    readAllUsers,
    createData,
}