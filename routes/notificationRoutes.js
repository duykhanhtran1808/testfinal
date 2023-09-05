const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get("/", (req, res, next) => {

    res.status(200).render("notificationsPage", {
        pageTitle: "Notifications",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    });
})

module.exports = router;