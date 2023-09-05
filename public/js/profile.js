// var theOtherUser = JSON.parse(userJSON);
// var selectedTab = JSON.parse(selectedTab);
$(document).prop('title', profileUser.firstName + " " + profileUser.lastName);
$( "#postsTab" ).attr("href", `/profile/${profileUser.username}`);
$( "#repliesTab" ).attr("href", `/profile/${profileUser.username}/replies`);
$( "#followersLink" ).attr("href", `/profile/${profileUser.username}/followers`);
$( "#followingLink" ).attr("href", `/profile/${profileUser.username}/following`);
$( ".displayName" ).text(profileUser.firstName + " " + profileUser.lastName);
$( "#firstH1ProfilePage" ).text(profileUser.firstName + " " + profileUser.lastName);
$( ".username" ).text(profileUser.username);
// $( "#followingValue" ).text(profileUser.following.length);
// $( "#followersValue" ).text(profileUser.followers.length);


if(profileUser._id != userLoggedIn._id) {
    $( "#profileMessageButton" ).attr("href", `/messages/${profileUser._id}`);
    var profileUserIdFollow = profileUser._id.toString();
    if(userLoggedIn.following && userLoggedIn.following.includes(profileUserIdFollow)) {
        $( ".profileButtonsContainer" ).append( createFollowButton(profileUser,true) );
    } else {
        $( ".profileButtonsContainer" ).append( createFollowButton(profileUser,false));
    }
} else {
    $( "#profileMessageButton" ).hide()
}

$(document).ready(() => {
    loadFollowers();
    loadFollowing();
    if(selectedTab === "replies") {
        var repliesTab = document.getElementById("repliesTab");
                repliesTab.classList.add("active");
        loadReplies();
    }
    else {
        var postsTab = document.getElementById("postsTab");
         postsTab.classList.add("active");
        loadPosts();
    }
});
function loadFollowers() {
    $.get(`/api/users/${profileUserId}/followers`, results => {
        
        $( "#followersValue" ).text(results.followers.length);
    })
    
}

function loadFollowing() {
    $.get(`/api/users/${profileUserId}/following`, results => {
        $( "#followingValue" ).text(results.following.length);
    })
   
}


function loadPosts() {
    $.get("/api/posts", { postedBy: profileUserId, pinned: true }, results => {
        outputPinnedPost(results, $(".pinnedPostContainer"));
    })

    $.get("/api/posts", { postedBy: profileUserId, isReply: false }, results => {
        makeManyPosts(results, $(".postsContainer"));
    })
}

function loadReplies() {
    $.get("/api/posts", { postedBy: profileUserId, isReply: true }, results => {
        makeManyPosts(results, $(".postsContainer"));
    })
}

function outputPinnedPost(results, container) {
    if(results.length == 0) {
        container.hide();
        return;
    }

    container.html("");

    results.forEach(result => {
        var html = makeAPost(result)
        container.append(html);
    });
}

  function createFollowButton(user, isFollowing) {
    const followButton = document.createElement('button');
    const text = isFollowing ? 'Following' : 'Follow';
    if(isFollowing) {
        followButton.classList.add("followButton");
        followButton.classList.add("following");
    } else {
        followButton.classList.add("followButton");
    }
    followButton.setAttribute('data-user', user._id);
    followButton.textContent = text;
  
    return followButton;
  }
