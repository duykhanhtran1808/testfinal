const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt");
const User = require('../schemas/UserSchema');

router.get("/", (req, res, next) => {
    var passingData = makePassingData(req.session.user)
    res.status(200).render("searchPage", passingData);
})

router.get("/:selectedTab", (req, res, next) => {
    var passingData = makePassingData(req.session.user)
    passingData.selectedTab = req.params.selectedTab;
    res.status(200).render("searchPage", passingData);
})

function makePassingData(userLoggedIn) {
    return {
        pageTitle: "Search",
        userLoggedIn: userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn)
    };
}

module.exports = router;