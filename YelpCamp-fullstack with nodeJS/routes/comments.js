var express = require("express");
var router  = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

router.get("/new", middleware.isLoggedIn, function(req,res){
    Campground.findById(req.params.id, function(err, campground){
        if (err){
            console.log(err);
        } else{
            res.render("comments/new", {campground:campground});
        }
    })
});

router.post("/", middleware.isLoggedIn, function(req,res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if (err){
            console.log(err);
            redirect("/compgrounds")
        } else{
            Comment.create(req.body.comment,function(err,comment){
                if (err){
                    req.flash("error", "Something goes wrong");
                    console.log(err);
                } else{
                    // add username and id to the comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save the comment
                    comment.save();
                    
                    foundCampground.comments.push(comment);
                    foundCampground.save();
                    req.flash("success", "Successfully added comment");
                    res.redirect("/campgrounds/"+foundCampground._id);
                }
            })
        }
    })
});

// edit comment
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req,res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if (err){
            console.log(err);
            res.redirect("back");
        } else{
            Comment.findById(req.params.comment_id, function(err, comment){
                if(err){
                    console.log(err);
                    redirect("/campgrounds/<%= foundCampground._id %>")
                } else{
                    res.render("comments/edit", {campground:foundCampground, comment:comment});
                }
            })
        }
    })
});

router.put("/:comment_id", middleware.checkCommentOwnership, function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if (err){
            console.log(err);
            res.redirect("back");
        } else{
            res.redirect("/campgrounds/"+req.params.id)
        }
    })
});

// delete comment
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted")
            res.redirect("/campgrounds/"+req.params.id)
        }
    })
})

module.exports = router;