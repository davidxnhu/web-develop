var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash       = require("connect-flash"),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
    seedDb      = require("./seeds"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    User        = require("./models/users"),
    methodOverride = require("method-override")

var commentRoutes       = require("./routes/comments"),
    campgroundRoutes    = require("./routes/campgrounds"),
    indexRoutes         = require("./routes/index")

mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")
app.use(express.static(__dirname + "/public"))
app.use(methodOverride("_method"));
// seedDb(); //seed the database

// Passport configuration
app.use(require("express-session")({
    secret:"WuWushidalang",
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.locals.moment = require("moment");

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
})

/* Campground.create(
    {name: "Salmon Creek", 
    image: "https://pixabay.com/get/ea36b70928f21c22d2524518b7444795ea76e5d004b0144291f6c27ca3efb4_340.jpg",
    description: "beautiful!",
    }, function(err,campground){
        if (err){
            console.log(err);
        } else{
            console.log("NEWLY CREATED CAMPGROUND:");
            console.log(campground);
        }
    }
) */

/* var campgrounds = [
    {name: "Salmon Creek", image: "https://pixabay.com/get/ea36b70928f21c22d2524518b7444795ea76e5d004b0144291f6c27ca3efb4_340.jpg"},
    {name: "Granite Hill", image: "https://pixabay.com/get/e830b70629f01c22d2524518b7444795ea76e5d004b0144291f6c27ca3efb4_340.png"},
    {name: "Mountain Goat's Rest", image: "https://farm4.staticflickr.com/3062/2984119099_82336dfc3b.jpg"},
    {name: "Salmon Creek", image: "https://pixabay.com/get/ea36b70928f21c22d2524518b7444795ea76e5d004b0144291f5c571a4e8b4_340.jpg"},
    {name: "Granite Hill", image: "https://pixabay.com/get/e83db50a21f4073ed1584d05fb1d4e97e07ee3d21cac104496f4c47dafeeb0b9_340.jpg"},
    {name: "Mountain Goat's Rest", image: "https://farm4.staticflickr.com/3062/2984119099_82336dfc3b.jpg"},
    {name: "Salmon Creek", image: "https://pixabay.com/get/ea36b70928f21c22d2524518b7444795ea76e5d004b0144291f5c571a4e8b4_340.jpg"},
    {name: "Granite Hill", image: "https://pixabay.com/get/e83db50a21f4073ed1584d05fb1d4e97e07ee3d21cac104496f4c47dafeeb0b9_340.jpg"},
    {name: "Mountain Goat's Rest", image: "https://farm4.staticflickr.com/3062/2984119099_82336dfc3b.jpg"},
]; */


// Use routes
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);

app.listen(3000, function(){
    console.log("YelpCamp has started!")
});