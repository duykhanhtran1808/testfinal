var thePostId = JSON.parse(postId)
$(document).ready(() => {
    $.get("/api/posts/" + thePostId, results => {
        var resultData = results;
        var htmlContainer = $(".postsContainer");

        htmlContainer.html("");

        if(resultData.replyTo !== undefined && resultData.replyTo._id !== undefined) {
            var html = makeAPost(resultData.replyTo)
            htmlContainer.append(html);
        }

        var mainPostHtml = makeAPost(resultData.postData, true)
        htmlContainer.append(mainPostHtml);

        resultData.replies.forEach(result => {
            var html = makeAPost(result)
            htmlContainer.append(html);
        });
    })
})