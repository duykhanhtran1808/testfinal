const express = require('express');
const router = express.Router();
const User = require('../schemas/UserSchema');
const mongoose = require('mongoose');

router.get("/", (req, res, next) => {

    res.status(200).render("profilePage", {
        pageTitle: req.session.user.username,
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        profileUser: req.session.user,
        selectedTab: "posts"
    });
})

router.get("/:username", async (req, res, next) => {

    var data = await getData(req.params.username, req.session.user);
    data.selectedTab = "posts";
    res.status(200).render("profilePage", data);
})

router.get("/:username/replies", async (req, res, next) => {

    var data = await getData(req.params.username, req.session.user);
    data.selectedTab = "replies";
    
    res.status(200).render("profilePage", data);
})

router.get("/:username/following", async (req, res, next) => {

    var data = await getData(req.params.username, req.session.user);
    data.selectedTab = "following";
    
    res.status(200).render("followersAndFollowing", data);
})

router.get("/:username/followers", async (req, res, next) => {

    var data = await getData(req.params.username, req.session.user);
    data.selectedTab = "followers";
    
    res.status(200).render("followersAndFollowing", data);
})

router.get("/:username/*", async (req, res, next) => {

    res.status(301).redirect("/");
})

async function getData(username, userLoggedIn) {
    
    var user = await User.findOne({ username: username })

    if(user == null) {

        var checkValidUserID = mongoose.isValidObjectId({ username: username });
        if(!checkValidUserID) {
            return {
                pageTitle: "User not found",
                userLoggedIn: userLoggedIn,
                userLoggedInJs: JSON.stringify(userLoggedIn)
            };
        }
        user = await User.findById(username);

        if (user == null) {
            return {
                pageTitle: "User not found",
                userLoggedIn: userLoggedIn,
                userLoggedInJs: JSON.stringify(userLoggedIn)
            }
        }
    }

    return {
        pageTitle: user.username,
        userLoggedIn: userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn),
        profileUser: user
    }
}

module.exports = router;