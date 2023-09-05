$( "#followersTab" ).attr("href", `/profile/${profileUser.username}/followers`);
$( "#followingTab" ).attr("href", `/profile/${profileUser.username}/following`);

$(document).ready(() => {

    if(selectedTab === "followers") {
        loadFollowers();
    }
    else {
        loadFollowing();
    }
});

function loadFollowers() {
    $.get(`/api/users/${profileUserId}/followers`, results => {
        makeUsersList(results.followers, $(".resultsContainer"));
        if(results.followers.length == 0) {
            $(".resultsContainer").append("<span class='noResults'>This user has no followers</span>")
        }
    })
    var tab = document.getElementById("followersTab");
        tab.classList.add("active");
}

function loadFollowing() {
    $.get(`/api/users/${profileUserId}/following`, results => {
        makeUsersList(results.following, $(".resultsContainer"));
        if(results.following.length == 0) {
            $(".resultsContainer").append("<span class='noResults'>This user follows no one</span>")
        }
    })
    var tab = document.getElementById("followingTab");
        tab.classList.add("active");
}

function makeUsersList(usersList, htmlContainer) {
    htmlContainer.html("");

    usersList.forEach(user => {
        var html = makeUserSection(user, true);
        htmlContainer.append(html);
    });
}