const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get("/:id", (req, res, next) => {

    var checkValidID = mongoose.isValidObjectId(req.params.id);

    if(!checkValidID) {
        return res.status(301).redirect("/");
    }

 res.status(200).render("postPage", {
        pageTitle: "View post",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        postId: req.params.id
    });
})

module.exports = router;