const User = require('../models/user')

async function readAllData(req, res) {
    try {
        const users = await User.find({})
        res.status(200).json(users)
    } catch {
        res.status(500).json("Some error occured in getting user data")
    }
}

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

async function updateData(req, res) {
    try {
        const userNotExist = await User.findOne({ _id: req.params.id })
        if (!userNotExist) {
            res.status(409).json("user does not exists")
        }
        else {
            await User.updateOne({ _id: req.params.id }, req.body)
            res.status(202).json("User updated")
        }
    } catch {
        res.status(500).json("The user_id entered may not be correct")
    }
}

async function deleteData(req, res) {
    try {
        const userNotExist = await User.findOne({ _id: req.params.id })
        if (!userNotExist) {
            res.status(409).json("user does not exists")
        }
        else {
            await User.deleteOne({ _id: req.params.id })
            res.status(203).json("User deleted successfully")
        }
    } catch {
        res.status(500).json("The user_id entered may not be correct")
    }
}

module.exports = {
    readAllData,
    createData,
    updateData,
    deleteData
}