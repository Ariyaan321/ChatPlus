const express = require('express')
const router = express.Router();
const {
    readAllUsers,
    createData,
} = require('../controllers/users')

router.get('/', readAllUsers)
    .post('/', createData)

module.exports = router;