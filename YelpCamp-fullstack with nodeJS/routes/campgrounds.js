var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: "YOURAPIKEY",
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

router.get("/", function(req,res){
    //res.render("campgrounds",{campgrounds:campgrounds})
    Campground.find({}, function(err, allCampgrounds){
        if (err){
            console.log(err);
        } else {
            res.render("campgrounds/index",{campgrounds:allCampgrounds});
        }
    });
});

router.post("/", middleware.isLoggedIn, function(req,res){
    var name = req.body.name;
    var image = req.body.image;
    var price = req.body.price;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }

    geocoder.geocode(req.body.campground.location, function(err, data){
        if (err || !data.length){
            req.flash("error", "Invalid address");
            return res.redirect("back");
        }
        var lat = data[0].lattitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        var newCampground = {name:name,image:image,description:description, price:price, location:location, lat:lat, lng:lng, author:author};
            Campground.create(newCampground, function(err,newlyCreated){
                if (err){
                    console.log(err);
                } else{
                    res.redirect("/campgrounds");
                }
            })
    })
});

router.get("/new", middleware.isLoggedIn, function(req,res){
    res.render("campgrounds/new")
});

router.get("/:id", function(req,res){
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
        if (err){
            console.log(err);
        } else{
            // Added this block, to check if foundCampground exists, and if it doesn't to throw an error via connect-flash and send us back to the homepage
            if (!foundCampground) {
                req.flash("error", "Item not found.");
                return res.redirect("back");
            }

            res.render("campgrounds/show", {campground:foundCampground})
        }
    });
    
});

//edit campground route
router.get("/:id/edit", function(req,res){
    Campground.findById(req.params.id, function(err, foundCampground){
            // Added this block, to check if foundCampground exists, and if it doesn't to throw an error via connect-flash and send us back to the homepage
            if (!foundCampground) {
                req.flash("error", "Item not found.");
                return res.redirect("back");
            }

        res.render("campgrounds/edit", {campground:foundCampground});
    });
});

router.put("/:id", function(req,res){
   geocoder.geocode(req.body.campground.location, function (err,data){
        if (err || data.length){
            console.log(err);
            console.log(data);
            req.flash("error", "Invalid address");
            return res.redirect("back");
        }
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;
        //find and update the correct campground
        Campground.findByIdAndUpdate(req.params.id,req.body.campground, function(err, updatedCampground){
            if(err){
                res.redirect("/campgrounds");
            } else{
                res.redirect("/campgrounds/" + req.params.id);
            }
        })
    });
});


//Destroy campground
router.delete("/:id", middleware.checkCampgroundOwnership, function(req,res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    })
})

module.exports = router;
