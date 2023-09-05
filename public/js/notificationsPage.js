$(document).ready(() => {
    $.get("/api/notifications", (data) => {
        notiList(data, $(".resultsContainer"))
    })
});

$("#markNotificationsAsRead").click(() => notiReadCheck());

