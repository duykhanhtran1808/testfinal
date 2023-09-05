var connected = false;

var socket = io("http://localhost:8888")
socket.emit("setup", userLoggedIn);

socket.on("connected", () => connected = true);
socket.on("message received", (newMessage) => messageReceived(newMessage));

socket.on("notification received", () => {
    $.get("/api/notifications/latest", (notificationData) => {
        notiPopup(notificationData)
        checkNewNoti();
    })
})

function emitNotification(userId) {
    if(userId == userLoggedIn._id) return;

    socket.emit("notification received", userId);
}