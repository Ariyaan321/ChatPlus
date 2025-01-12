const express = require('express')
const router = express.Router();
const {
    getMessage,
    sendMessage,
    // updateData,
    // deleteData
} = require('../controllers/messages')

router.get('/', getMessage)
    .post('/send', sendMessage)
// .put('/:id', updateData) // I don't think we need put
// .delete('/:id', deleteData) // don't need delete as well OR maybe we can add a feature using this

module.exports = router;