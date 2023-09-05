const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt");
const User = require('../schemas/UserSchema');

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", (req, res, next) => {

    res.status(200).render("register");
})

router.post("/", async (req, res, next) => {

    var firstName = req.body.firstName.trim();
    var lastName = req.body.lastName.trim();
    var username = req.body.username.trim();
    var email = req.body.email.trim();
    var password = req.body.password;

    var passingData = req.body;

    if(firstName && lastName && username && email && password) {
        var user = await User.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        })
        .catch((error) => {
            console.log(error);
            passingData.errorMessage = "Something went wrong.";
            res.status(200).render("register", passingData);
        });

        if(user == null) {
            // No user found
            var data = req.body;
            data.password = await bcrypt.hash(password, 10);

            User.create(data)
            .then((user) => {
                req.session.user = user;
                return res.redirect("/");
            })
        }
        else {
            // User found
            if (email == user.email) {
                passingData.errorMessage = "Email existed. Please choose another email!";
            }
            else {
                passingData.errorMessage = "Username existed. Please choose another username!";
            }
            res.status(200).render("register", passingData);
        }
    }
    else {
        passingData.errorMessage = "Invalid information.";
        res.status(200).render("register", passingData);
    }
})

module.exports = router;