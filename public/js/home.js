$(document).ready(() => {
    $.get("/api/posts", { followingOnly: false, isReply: false }, results => {
        makeManyPosts(results, $(".postsContainer"));
    })
})