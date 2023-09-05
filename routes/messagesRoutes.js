const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

//Loading Schema
const User = require('../schemas/UserSchema');
const Chat = require('../schemas/ChatSchema');

router.get("/", (req, res, next) => {
    res.status(200).render("inboxPage", {
        pageTitle: "Inbox",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    });
})

router.get("/new", (req, res, next) => {
    res.status(200).render("newMessage", {
        pageTitle: "New message",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    });
})

router.get("/:chatId", async (req, res, next) => {

    var ID_User = req.session.user._id;
    var ID_Chat = req.params.chatId;
    var checkValidID = mongoose.isValidObjectId(ID_Chat);


    var passingData = {
        pageTitle: "Chat",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    };

    if(!checkValidID) {
        passingData.errorMessage = "The chat is invalid";
        return res.status(200).render("chatPage", passingData);
    }

    var chat = await Chat.findOne({ _id: ID_Chat, users: { $elemMatch: { $eq: ID_User } } })
    .populate("users");

    if(chat == null) {
        //Check chat ID
        var checkUser = await User.findById(ID_Chat);

        if(checkUser != null) {
            //Get chat
            chat = await getChatByUserId(checkUser._id, ID_User);
        }
    }

    if(chat == null) {
        passingData.errorMessage = "The chat is invalid";
    }
    else {
        passingData.chat = chat;
    }

    res.status(200).render("chatPage", passingData);
})

function getChatByUserId(userLoggedInId, otherUserId) {
    return Chat.findOneAndUpdate({
        isGroupChat: false,
        users: {
            $size: 2,
            $all: [
                { $elemMatch: { $eq: mongoose.Types.ObjectId(userLoggedInId) }},
                { $elemMatch: { $eq: mongoose.Types.ObjectId(otherUserId) }}
            ]
        }
    },
    {
        $setOnInsert: {
            users: [userLoggedInId, otherUserId]
        }
    },
    {
        new: true,
        upsert: true
    })
    .populate("users");
}

module.exports = router;