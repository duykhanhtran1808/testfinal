const express = require('express');
const middleware = require('./middleware')
const path = require('path')
const session = require("express-session");

//Mongoose setup
const mongoose = require("mongoose");
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);

//Setup server
const app = express();
const port = process.env.PORT || 8888;
const server = app.listen(port, () => console.log(`Server is running on port ${port}`));
const io = require("socket.io")(server, { pingTimeout: 60000 });

//Setup view engine: ejs
app.set("view engine", "ejs");
app.set("views", "views");

//Parse incoming request bodies with URL-encoded data
app.use(express.urlencoded({ extended: false }));
//Static files path
app.use(express.static(path.join(__dirname, "public")));

//App session
app.use(session({
    secret: "I love university of Hertfordshire",
    resave: true,
    saveUninitialized: false
}))

// Routes
app.use("/login", require('./routes/loginRoutes'));
app.use("/register", require('./routes/registerRoutes'));
app.use("/logout", require('./routes/logout'));
app.use("/posts", middleware.checkIfUserLoggedIn, require('./routes/postRoutes'));
app.use("/profile", middleware.checkIfUserLoggedIn, require('./routes/profileRoutes'));
app.use("/uploads", require('./routes/uploadRoutes'));
app.use("/search", middleware.checkIfUserLoggedIn, require('./routes/searchRoutes'));
app.use("/messages", middleware.checkIfUserLoggedIn, require('./routes/messagesRoutes'));
app.use("/notifications", middleware.checkIfUserLoggedIn, require('./routes/notificationRoutes'));

// Api routes
app.use("/api/posts", require('./routes/api/posts'));
app.use("/api/users", require('./routes/api/users'));
app.use("/api/chats", require('./routes/api/chats'));
app.use("/api/messages", require('./routes/api/messages'));
app.use("/api/notifications", require('./routes/api/notifications'));

//Check if logged in
app.get("/", middleware.checkIfUserLoggedIn, (req, res, next) => {

    var passingData = {
        pageTitle: "Home",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
    }

    res.status(200).render("home", passingData);
})

app.get("/*", middleware.checkIfUserLoggedIn, (req, res, next) => {

    res.status(301).redirect("/");
})

//Database setup
mongoose.connect("mongodb+srv://duykhanhtran1808:gNfvtdaNIgGcuOH2@duykhanh.invfinz.mongodb.net/p001?retryWrites=true&w=majority")
    .then(() => {
        console.log("database connection successful");
    })
    .catch((err) => {
        console.log("database connection error " + err);
    })

//Socket.io
io.on("connection", socket => {

    socket.on("setup", userData => {
        socket.join(userData._id);
        socket.emit("connected");
        console.log(`User (${userData.username}) connected.`);
    })

    socket.on("join room", room => socket.join(room));
    // socket.on("typing", room => socket.in(room).emit("typing"));
    // socket.on("stop typing", room => socket.in(room).emit("stop typing"));
    socket.on("notification received", room => socket.in(room).emit("notification received"));

    socket.on("new message", newMessage => {
        var chat = newMessage.chat;

        if(!chat.users) return console.log("Chat.users not defined");

        chat.users.forEach(user => {
            
            if(user._id == newMessage.sender._id) return;
            socket.in(user._id).emit("message received", newMessage);
        })
    });

})