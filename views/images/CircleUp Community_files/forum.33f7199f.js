(function ($) {
    $(document).ready(function () {
        $("#forum-new-thread").validate();

        var brFilter = function(orig){
            return  orig.replace(/<br>/g,"\n");
        };

        var lbFilter = function(orig){
            return orig.replace(/\n\r?/g,"<br>");
        };

        // reset the form after it's been used
        var clearNewThreadForm = function () {
            $('#post-subject').val('');
            $('#post-type').val('');
            $('#post-body').val('');
        };

        var addPost = function (data) {
            var newPost;
            if ('post-parent-id' in data) {
                newPost = $("#hidden-reply").clone();
                newPost.attr('id', '');

                newPost.find(".post-body p").html(lbFilter(data['post-body']));
                newPost.find(".reply-header-auth").html("<a href='data[\"post-author-slug\"]'>" +data['post-author'] + "</a> &nbsp;&bull;&nbsp; " + data['post-timesince']);
                newPost.find(".reply-avatar img").attr('src', data['post-author-picture']);

                var selector = 'div[data-post-id=' + data['post-parent-id'] + ']';
                $(selector).children('.reply-posts').children('.reply-form').before(newPost);
            } else {
                newPost = $("#hidden-post").clone();
                newPost.attr('id', '');
                newPost.find(".post-subject").html(data['post-subject']);
                newPost.find(".post-body p").html(lbFilter(data['post-body']));
                newPost.find(".post-auth").html("<a href='data[\"post-author-slug\"]'>" + data['post-author'] + "</a> &nbsp;&bull;&nbsp; " + data['post-timesince']);
                newPost.find(".avatar img").attr('src', data['post-author-picture']);
                newPost.find('.post-header-left').addClass(data['post-class-name']);

                newPost.attr('data-post-id', data['post-id']);
                newPost.find('.reply-form form input[name=post-parent-id]').val(data['post-id']);

                newPost.find(".deleteLink").attr("data-post-id",data['post-id']);
                newPost.find(".editLink").attr("data-post-id",data['post-id']);
                newPost.find(".post-body form").attr("action","/forum/edit/"+data['post-id']);

                newPost.find(".editLink").click(function(){
                    var postBody = $(this).closest(".post").find(".post-body");
                    var postOrig = postBody.find("p").html();

                    postBody.find("p").hide();
                    postBody.find("textarea").html(brFilter(postOrig));
                    postBody.find("form").show();
                });

                newPost.find(".editSubmit").click(function(){
                    var postId = $(this).attr("data-post-id");
                    var form = $(this).parents('form');
                    var postBody = $(this).parents(".post-body");

                    form.ajaxSubmit({
                        dataType:'json',
                        success:function (data) {
                            postBody.find("form").hide();
                            postBody.find("p").html(lbFilter(postBody.find("textarea").val()));
                            postBody.find("p").show();
                            $CU.displayInfo("Forum message updated.")
                        },
                        error: function() {
                            $CU.displayError();
                        }
                    });

                    return false;
                });

                newPost.find(".deleteLink").click(function() {
                    var postId = $(this).attr("data-post-id");
                    $("#deleteConfirm").attr("data-post-id",postId);
                    parent = $(this).parents('.post');
                    return true;
                });

                $('#forumcontent').prepend(newPost);
            }

            newPost.show('fast', function () {
                var newHeight = $("#forum").height();

                // we need to adjust the height of the div tab or the bottom of the forum will be cut off
                $(".panes").delay(500).animate({
                    height:newHeight + 50
                });
            });

        };


        var submissionInProgress = false;

        $('#forum').on('click', "#thread-submit-button, .reply-form-submit", function (event) {
            if(!submissionInProgress) {
                submissionInProgress = true;
                var form = $(this).closest('form');
                var parent = form.parent();
                var post = form.parents(".post");

                form.find(".loading").css("display","inline-block");

                form.ajaxSubmit({
                    dataType:'json',
                    success:function (data) {

                        if(data['status']=='success') {
                            clearNewThreadForm();
                            addPost(data['obj']);
                            form.find('textarea').val('');

                            if(post.length != 0){
                                parent.hide();
                            }

                            if(post.find(".editLinks").length > 0){
                                post.find(".editLinks").hide();
                            }


                            $CU.displayInfo("Forum message posted.");
                        } else {
                            $CU.displayError(data['reason']);
                        }
                    },
                    error: function() {
                        $CU.displayError();
                    },
                    complete: function() {
                        submissionInProgress = false;
                        form.find(".loading").hide();
                    }
                });
            }
            return false;
        });

        // Forum actions (show/hide reply forms, etc.)

        $(".community-forum").on("click", ".replyLink", function (event) {
            var post = $(this).closest(".post");
            var replyForm = post.find(".reply-form");
            var maxHeight = $(window).height();

            replyForm.show("fast");

            //Auto scroll to reply input
            if(post.height() > maxHeight){
                $('html, body').animate({scrollTop: replyForm.position().top-maxHeight+165}, 500);
            }
            else{
                $('html, body').animate({scrollTop: post.position().top}, 500);
            }


            return false;
        });

        var parent;

        $(".editLink").click(function(){
            var postBody = $(this).closest(".post").find(".post-body");
            var postOrig = postBody.find("p").html();

            postBody.find("p").hide();
            postBody.find("textarea").html(brFilter(postOrig));
            postBody.find("form").show();
        });

        $(".editSubmit").click(function(){
            var postId = $(this).attr("data-post-id");
            var form = $(this).parents('form');
            var postBody = $(this).parents(".post-body");

            form.ajaxSubmit({
                dataType:'json',
                success:function (data) {
                    postBody.find("form").hide();
                    postBody.find("p").html(lbFilter(postBody.find("textarea").val()));
                    postBody.find("p").show();
                    $CU.displayInfo("Forum message updated.")
                },
                error: function() {
                    $CU.displayError();
                }
            });

            return false;
        });

        $(".deleteLink").click(function() {
            var postId = $(this).attr("data-post-id");
            $("#deleteConfirm").attr("data-post-id",postId);
            parent = $(this).parents('.post');
            return true; // actually do need default action (modal popup) to trigger
        });

        $("#deleteConfirm .btn-primary").click(function(){
            $("#deleteConfirm").modal('toggle');
            var postId = $("#deleteConfirm").attr("data-post-id");

            $CU.ajax('/forum/delete/' + postId,
                function(result) {
                    parent.hide();
                    $CU.displayInfo("Forum message deleted.")
                }
            );
            return false;
        });
    });
})(window.jQuery);
