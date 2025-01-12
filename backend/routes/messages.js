const express = require('express')
const router = express.Router();
const {
    getMessage,
    handleSendMessage,
    // updateData,
    // deleteData
} = require('../controllers/messages')

router.post('/get', getMessage)
    .post('/send', handleSendMessage)
// .put('/:id', updateData) // I don't think we need put
// .delete('/:id', deleteData) // don't need delete as well OR maybe we can add a feature using this

module.exports = router;