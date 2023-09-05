const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", (req, res, next) => {
    var currentSession = req.session;
    if(currentSession) {
        currentSession.destroy(() => {
            res.redirect("/login");
        })
    }
})

module.exports = router;