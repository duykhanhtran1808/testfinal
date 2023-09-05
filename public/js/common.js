// Globals
var cropper;
var timer;
var selectedUsers = [];

$(document).ready(() => {
    checkNewMsg();
    checkNewNoti();
})

$("#postTextarea, #replyTextarea").keyup(event => {
    var textbox = $(event.target);
    var value = textbox.val().trim();

    var isModal = textbox.parents(".modal").length == 1;
    
    var submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton");

    if(submitButton.length == 0) return alert("No submit button found");

    if (value == "") {
        submitButton.prop("disabled", true);
        return;
    }

    submitButton.prop("disabled", false);
})

$("#submitPostButton, #submitReplyButton").click(() => {
    var button = $(event.target);

    var isModal = button.parents(".modal").length == 1;
    var textbox = isModal ? $("#replyTextarea") : $("#postTextarea");

    var data = {
        content: textbox.val()
    }

    if (isModal) {
        var id = button.data().id;
        if(id == null) return alert("Button id is null");
        data.replyTo = id;
    }

    $.post("/api/posts", data, postData => {

        if(postData.replyTo) {
            emitNotification(postData.replyTo.postedBy)
            location.reload();
        }
        else {
            var html = makeAPost(postData);
            $(".postsContainer").prepend(html);
            textbox.val("");
            button.prop("disabled", true);
            location.reload();
        }
    })
})

$("#replyModal").on("show.bs.modal", (event) => {
    var button = $(event.relatedTarget);
    var postId = findPostId(button);
    $("#submitReplyButton").data("id", postId);

    $.get("/api/posts/" + postId, results => {
        makeManyPosts(results.postData, $("#originalPostContainer"));
    })
})

$("#replyModal").on("hidden.bs.modal", () => $("#originalPostContainer").html(""));

$("#deletePostModal").on("show.bs.modal", (event) => {
    var button = $(event.relatedTarget);
    var postId = findPostId(button);
    $("#deletePostButton").data("id", postId);
})

$("#confirmPinModal").on("show.bs.modal", (event) => {
    var button = $(event.relatedTarget);
    var postId = findPostId(button);
    $("#pinPostButton").data("id", postId);
})

$("#unpinModal").on("show.bs.modal", (event) => {
    var button = $(event.relatedTarget);
    var postId = findPostId(button);
    $("#unpinPostButton").data("id", postId);
})

$("#deletePostButton").click((event) => {
    var postId = $(event.target).data("id");

    $.ajax({
        url: `/api/posts/${postId}`,
        type: "DELETE",
        success: (data, status, xhr) => {

            if(xhr.status != 202) {
                alert("could not delete post");
                return;
            }
            
            location.reload();
        }
    })
})

$("#pinPostButton").click((event) => {
    var postId = $(event.target).data("id");

    $.ajax({
        url: `/api/posts/${postId}`,
        type: "PUT",
        data: { pinned: true },
        success: (data, status, xhr) => {

            if(xhr.status != 204) {
                alert("could not delete post");
                return;
            }
            
            location.reload();
        }
    })
})

$("#unpinPostButton").click((event) => {
    var postId = $(event.target).data("id");

    $.ajax({
        url: `/api/posts/${postId}`,
        type: "PUT",
        data: { pinned: false },
        success: (data, status, xhr) => {

            if(xhr.status != 204) {
                alert("could not delete post");
                return;
            }
            
            location.reload();
        }
    })
})

$("#filePhoto").change(function(){    
    if(this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = (e) => {
            var image = document.getElementById("imagePreview");
            image.src = e.target.result;

            if(cropper !== undefined) {
                cropper.destroy();
            }

            cropper = new Cropper(image, {
                aspectRatio: 1 / 1,
                background: false
            });

        }
        reader.readAsDataURL(this.files[0]);
    }
    else {
        console.log("nope")
    }
})

$("#coverPhoto").change(function(){    
    if(this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = (e) => {
            var image = document.getElementById("coverPreview");
            image.src = e.target.result;

            if(cropper !== undefined) {
                cropper.destroy();
            }

            cropper = new Cropper(image, {
                aspectRatio: 16 / 9,
                background: false
            });

        }
        reader.readAsDataURL(this.files[0]);
    }
})

$("#imageUploadButton").click(() => {
    var canvas = cropper.getCroppedCanvas();

    if(canvas == null) {
        alert("Could not upload image. Make sure it is an image file.");
        return;
    }

    canvas.toBlob((blob) => {
        var formData = new FormData();
        formData.append("croppedImage", blob);

        $.ajax({
            url: "/api/users/profilePicture",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: () => location.reload()
        })
    })
})

$("#coverPhotoButton").click(() => {
    var canvas = cropper.getCroppedCanvas();

    if(canvas == null) {
        alert("Could not upload image. Make sure it is an image file.");
        return;
    }

    canvas.toBlob((blob) => {
        var formData = new FormData();
        formData.append("croppedImage", blob);

        $.ajax({
            url: "/api/users/coverPhoto",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: () => location.reload()
        })
    })
})

$("#userSearchTextbox").keydown((event) => {
    clearTimeout(timer);
    var textbox = $(event.target);
    var value = textbox.val();

    if (value == "" && (event.which == 8 || event.keyCode == 8)) {
        // remove user from selection
        selectedUsers.pop();
        updateSelectedUsersHtml();
        $(".resultsContainer").html("");

        if(selectedUsers.length == 0) {
            $("#createChatButton").prop("disabled", true);
        }

        return;
    }

    timer = setTimeout(() => {
        value = textbox.val().trim();

        if(value == "") {
            $(".resultsContainer").html("");
        }
        else {
            $.get("/api/users", { search: value }, results => {
                outputSelectableUsers(results, $(".resultsContainer"));
            })
        }
    }, 1000)

})

$("#createChatButton").click(() => {
    var data = JSON.stringify(selectedUsers);

    $.post("/api/chats", { users: data }, chat => {

        if(!chat || !chat._id) return alert("Invalid response from server.");

        window.location.href = `/messages/${chat._id}`;
    })
})

$(document).on("click", ".likeButton", (event) => {
    var button = $(event.target);
    var postId = findPostId(button);
    
    if(postId === undefined) return;

    $.ajax({
        url: `/api/posts/${postId}/like`,
        type: "PUT",
        success: (postData) => {
            
            button.find("span").text(postData.likes.length || "");

            if(postData.likes.includes(userLoggedIn._id)) {
                button.addClass("active");
                emitNotification(postData.postedBy)
            }
            else {
                button.removeClass("active");
            }

        }
    })

})

$(document).on("click", ".hearButton", (event) => {
    var button = $(event.target);
    var postId = findPostId(button);
    
    if(postId === undefined) return;


    $.ajax({
        url: `/api/posts/${postId}`,
        type: "GET",
        dataType: 'json', 
        success: (res) => {
            var postContent = res.postData.content;
            var toSpeak = new SpeechSynthesisUtterance();

            toSpeak.text = postContent;
            toSpeak.voice = window.speechSynthesis.getVoices()[0];
            window.speechSynthesis.speak(toSpeak);

        }
    })

})

$(document).on("click", ".post", (event) => {
    var element = $(event.target);
    var postId = findPostId(element);

    if(postId !== undefined && !element.is("button")) {
        window.location.href = '/posts/' + postId;
    }
});

$(document).on("click", ".followButton", (e) => {
    var button = $(e.target);
    var userId = button.data().user;
    
    $.ajax({
        url: `/api/users/${userId}/follow`,
        type: "PUT",
        success: (data, status, xhr) => { 
            
            if (xhr.status == 404) {
                alert("user not found");
                return;
            }
            
            var difference = 1;
            if(data.following && data.following.includes(userId)) {
                button.addClass("following");
                button.text("Following");
                emitNotification(userId);
            }
            else {
                button.removeClass("following");
                button.text("Follow");
                difference = -1;
            }
            
            var followersLabel = $("#followersValue");
            if(followersLabel.length != 0) {
                var followersText = followersLabel.text();
                followersText = parseInt(followersText);
                followersLabel.text(followersText + difference);
            }
        }
    })
});

$(document).on("click", ".notification.active", (e) => {
    var container = $(e.target);
    var notificationId = container.data().id;

    var href = container.attr("href");
    e.preventDefault();

    var callback = () => window.location = href;
    notiReadCheck(notificationId, callback);
})

function findPostId(component) {
    var checkIfRoot = component.hasClass("post");
    var rootComponent = checkIfRoot == true ? component : component.closest(".post");
    var post_id = rootComponent.data().id;

    if(post_id === undefined) return alert("The post is undefined");

    return post_id;
}

function makeAPost(postInformation, useBigFont = false) {

    if(postInformation == null) return alert("post object is null");

    var isRetweet = postInformation.retweetData !== undefined;
    var retweetedBy = isRetweet ? postInformation.postedBy.username : null;
    postInformation = isRetweet ? postInformation.retweetData : postInformation;
    
    var authorOfPost = postInformation.postedBy;

    if(authorOfPost._id === undefined) {
        return console.log("Does not know whose post is this");
    }

    var shownName = authorOfPost.firstName + " " + authorOfPost.lastName;
    var postTimeDifference = timeDifference(new Date(), new Date(postInformation.createdAt));

    var alreadyLiked = postInformation.likes.includes(userLoggedIn._id) ? "active" : "";
    var bigFont = useBigFont ? "largeFont" : "";

    var retweetText = '';
    if(isRetweet) {
        retweetText = `<span>
                        <i class='fas fa-retweet'></i>
                        Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a>    
                    </span>`
    }

    var replyFlag = "";
    if(postInformation.replyTo && postInformation.replyTo._id) {
        
        if(!postInformation.replyTo._id) {
            return alert("Reply is not available");
        }
        else if(!postInformation.replyTo.postedBy._id) {
            return alert("Author is not available");
        }

        var replyToUsername = postInformation.replyTo.postedBy.username;
        replyFlag = `<div class='replyFlag'>
                        Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}<a>
                    </div>`;

    }

    var buttons = "";
    
    return `<div class='post ${bigFont}' data-id='${postInformation._id}'>
                <div class='postActionContainer'>
                    ${retweetText}
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${authorOfPost.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
                        <div class='header'>
                            <a href='/profile/${authorOfPost.username}' class='displayName'>${shownName}</a>
                            <span class='username'>@${authorOfPost.username}</span>
                            <span class='date'>${postTimeDifference}</span>
                            ${buttons}
                        </div>
                        ${replyFlag}
                        <div class='postBody'>
                            <span class='contentForSpeak'>${postInformation.content}</span>
                        </div>
                        <div class='postFooter'>
                            <div class='postButtonContainer'>
                                <button data-toggle='modal' data-target='#replyModal'>
                                    <i class='far fa-comment'></i>
                                </button>
                            </div>
                            <div class='postButtonContainer green'>
                                <button class='hearButton active'>
                                    <i class='fa fa-volume-up'></i>
                                </button>
                            </div>
                            <div class='postButtonContainer red'>
                                <button class='likeButton ${alreadyLiked}'>
                                    <i class='far fa-heart'></i>
                                    <span>${postInformation.likes.length || ""}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}

function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if(elapsed/1000 < 30) return "Just now";
        
        return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}

function makeManyPosts(inputData, htmlContainer) {
    htmlContainer.html("");

    if(!Array.isArray(inputData)) {
        inputData = [inputData];
    }

    inputData.forEach(result => {
        var html = makeAPost(result)
        htmlContainer.append(html);
    });

    if (inputData.length == 0) {
        htmlContainer.append("<span class='noResults'>Nothing here.</span>")
    }
}

function makeUserSection(inputUser, followLink) {

    var displayName = inputUser.firstName + " " + inputUser.lastName;
    var checkIfFollow = userLoggedIn.following && userLoggedIn.following.includes(inputUser._id);
    var text = checkIfFollow ? "Following" : "Follow"
    var buttonClass = checkIfFollow ? "followButton following" : "followButton"

    var followButton = "";
    if (followLink && userLoggedIn._id != inputUser._id) {
        followButton = `<div class='followButtonContainer'>
                            <button class='${buttonClass}' data-user='${inputUser._id}'>${text}</button>
                        </div>`;
    }

    return `<div class='user'>
                <div class='userImageContainer'>
                    <img src='${inputUser.profilePic}'>
                </div>
                <div class='userDetailsContainer'>
                    <div class='header'>
                        <a href='/profile/${inputUser.username}'>${displayName}</a>
                        <span class='username'>@${inputUser.username}</span>
                    </div>
                </div>
                ${followButton}
            </div>`;
}


// function outputSelectableUsers(results, container) {
//     container.html("");

//     results.forEach(result => {
        
//         if(result._id == userLoggedIn._id || selectedUsers.some(u => u._id == result._id)) {
//             return;
//         }

//         var html = makeUserSection(result, false);
//         var element = $(html);
//         element.click(() => userSelected(result))

//         container.append(element);
//     });

//     if(results.length == 0) {
//         container.append("<span class='noResults'>No users found</span>")
//     }
// }

// function userSelected(user) {
//     selectedUsers.push(user);
//     updateSelectedUsersHtml()
//     $("#userSearchTextbox").val("").focus();
//     $(".resultsContainer").html("");
//     $("#createChatButton").prop("disabled", false);
// }

// function updateSelectedUsersHtml() {
//     var elements = [];

//     selectedUsers.forEach(user => {
//         var name = user.firstName + " " + user.lastName;
//         var userElement = $(`<span class='selectedUser'>${name}</span>`);
//         elements.push(userElement);
//     })

//     $(".selectedUser").remove();
//     $("#selectedUsers").prepend(elements);
// }

function getChatName(chatInfo) {
    var chatTitle = chatInfo.chatName;

    if(!chatTitle) {
        var otherUsers = getOtherChatUsers(chatInfo.users);
        var namesArray = otherUsers.map(user => user.firstName + " " + user.lastName);
        chatTitle = namesArray.join(", ")
    }

    return chatTitle;
}

function getOtherChatUsers(users) {
    if(users.length == 1) return users;

    return users.filter(user => user._id != userLoggedIn._id);
}

function messageReceived(newMessage) {
    // console.log("common.js")
    if($(`[data-room="${newMessage.chat._id}"]`).length == 0) {
        // Show popup notification
        msgPopup(newMessage);
        addChatMessageHtml(newMessage);
    }
    else {
        addChatMessageHtml(newMessage);
    }

    checkNewMsg()
}

function notiReadCheck(notiId = null, callback = null) {
    if(callback == null) callback = () => location.reload();

    var url = notiId != null ? `/api/notifications/${notiId}/markAsOpened` : `/api/notifications/markAsOpened`;
    $.ajax({
        url: url,
        type: "PUT",
        success: () => callback()
    })
}

function checkNewMsg() {
    $.get("/api/chats", { unreadOnly: true }, (data) => {
        
        var numResults = data.length;

        if(numResults > 0) {
            $("#messagesBadge").text(numResults).addClass("active");
        }
        else {
            $("#messagesBadge").text("").removeClass("active");
        }

    })
}

function checkNewNoti() {
    $.get("/api/notifications", { unreadOnly: true }, (data) => {
        
        var numResults = data.length;

        if(numResults > 0) {
            $("#notificationBadge").text(numResults).addClass("active");
        }
        else {
            $("#notificationBadge").text("").removeClass("active");
        }

    })
}

function notiPopup(data) {
    var template = makeNotiHtml(data);
    var component = $(template);
    component.hide().prependTo("#notificationList").slideDown("fast");

    setTimeout(() => component.fadeOut(400), 5000);
}

function msgPopup(input) {

    if(!input.chat.latestMessage._id) {
        input.chat.latestMessage = input;
    }

    var template = makeChatTemplate(input.chat);
    var component = $(template);
    component.hide().prependTo("#notificationList").slideDown("fast");

    setTimeout(() => component.fadeOut(400), 5000);
}

function notiList(notis, htmlHolder) {
    notis.forEach(noti => {
        var template = makeNotiHtml(noti);
        htmlHolder.append(template);
    })

    if(notis.length == 0) {
        htmlHolder.append("<span class='noResults'>Nothing to show.</span>");
    }
}

function makeNotiHtml(noti) {
    var notiUser = noti.userFrom;
    var textOfNotification = notiText(noti);
    var link = notiUrl(noti);
    var notiClass = noti.opened ? "" : "active";

    return `<a href='${link}' class='resultListItem notification ${notiClass}' data-id='${noti._id}'>
                <div class='resultsImageContainer'>
                    <img src='${notiUser.profilePic}'>
                </div>
                <div class='resultsDetailsContainer ellipsis'>
                    <span class='ellipsis'>${textOfNotification}</span>
                </div>
            </a>`;
}

function notiText(noti) {

    var notiUser = noti.userFrom;

    if(!notiUser.firstName || !notiUser.lastName) {
        return alert("Can't find noti user");
    }

    var notiUserName = `${notiUser.firstName} ${notiUser.lastName}`;
    
    var notiTextDetail;

    if(noti.notificationType == "retweet") {
        notiTextDetail = `${notiUserName} retweeted one of your posts`;
    }
    else if(noti.notificationType == "postLike") {
        notiTextDetail = `${notiUserName} liked one of your posts`;
    }
    else if(noti.notificationType == "reply") {
        notiTextDetail = `${notiUserName} replied to one of your posts`;
    }
    else if(noti.notificationType == "follow") {
        notiTextDetail = `${notiUserName} followed you`;
    }

    return `<span class='ellipsis'>${notiTextDetail}</span>`;
}

function notiUrl(noti) { 
    var url = "#";

    if(noti.notificationType == "retweet" || 
        noti.notificationType == "postLike" || 
        noti.notificationType == "reply") {
            
        url = `/posts/${noti.entityId}`;
    }
    else if(noti.notificationType == "follow") {
        url = `/profile/${noti.userFrom.username}`;
    }

    return url;
}

function makeChatTemplate(inputData) {
    var nameOfChat = getChatName(inputData);
    var imageOfChat = getChatImg(inputData);
    var newMsg = getNewMsg(inputData.latestMessage);

    var chatClass = !inputData.latestMessage || inputData.latestMessage.readBy.includes(userLoggedIn._id) ? "" : "active";
    
    return `<a href='/messages/${inputData._id}' class='resultListItem ${chatClass}'>
                ${imageOfChat}
                <div class='resultsDetailsContainer ellipsis'>
                    <span class='heading ellipsis'>${nameOfChat}</span>
                    <span class='subText ellipsis'>${newMsg}</span>
                </div>
            </a>`;
}

function getNewMsg(newMsg) {
    if(newMsg != null) {
        var author = newMsg.sender;
        return `${author.firstName} ${author.lastName}: ${newMsg.content}`;
    }

    return "New chat";
}

function getChatImg(chat) {
    var otherUsers = getOtherChatUsers(chat.users);

    var chatClass = "";
    var chatImg = getUserChatImg(otherUsers[0]);

    if(otherUsers.length > 1) {
        chatClass = "groupChatImage";
        chatImg += getUserChatImg(otherUsers[1]);
    }

    return `<div class='resultsImageContainer ${chatClass}'>${chatImg}</div>`;
}

function getUserChatImg(inputUser) {
    if(!inputUser || !inputUser.profilePic) {
        return alert("Invalid user image");
    }

    return `<img src='${inputUser.profilePic}' alt='User's profile pic'>`;
}
