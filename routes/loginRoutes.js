const express = require('express');
const app = express();
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt");
const router = express.Router();


//User Schema
const User = require('../schemas/UserSchema');

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", (req, res, next) => {
    res.status(200).render("login");
})

router.post("/", async (req, res, next) => {

    var requestBody = req.body;

    if(requestBody.logUsername && requestBody.logPassword) {
        var user = await User.findOne({
            $or: [
                { username: requestBody.logUsername },
                { email: requestBody.logUsername }
            ]
        })
        .catch((e) => {
            console.log(e);
            requestBody.errorMessage = "Error logging in :(";
            res.status(200).render("login", requestBody);
        });
        
        if(user != null) {
            var result = await bcrypt.compare(requestBody.logPassword, user.password);

            if(result === true) {
                req.session.user = user;
                return res.redirect("/");
            }
        }

        requestBody.errorMessage = "Wrong Login Information :(";
        return res.status(200).render("login", requestBody);
    }

    requestBody.errorMessage = "Please enter a valid username/email and password!";
    res.status(200).render("login");
})

module.exports = router;