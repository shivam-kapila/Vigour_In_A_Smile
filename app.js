var bodyParser = require("body-parser"),
methodOveride  = require("method-override"),
expressSanitizer = require("express-sanitizer"),
mongoose       = require("mongoose"),
express        = require("express"),
app            = express();

// APP CONFIG
mongoose.connect("mongodb://localhost/restful_blog_app");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOveride("_method"));

// MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
    name: String,
    email: String,
    title: String,
    image: String,
    body: String,
    likes: Number,
    created: {type: Date, default: Date.now},
    comments:[ {
        name: String,
        comment: String
    }
]
});

var Blog = mongoose.model("Blog", blogSchema);

// RESTFUL ROUTES

app.get("/", function(req, res){
    res.redirect("/blogs");
});

// INDEX ROUTE
app.get("/blogs", function(req, res){
    Blog.find({}, function (err, blogs) {
        if(err){
            console.log(err);
        } else {
    res.render("index", {blogs: blogs});            
        }
    });
});

// NEW ROUTE
app.get("/blogs/new", function(req, res){
    res.render("new");
});

// CREATE ROUTE
app.post("/blogs", function (req, res) {
    //create blog
    req.body.blog.body = req.sanitize(req.body.blog.body);
    // req.body.blog.name = req.user.name";
    req.body.blog.name ="Shivam";
    // req.body.blog.email = req.user.email;
    req.body.blog.email ="shivamkapila4@gmail.com";
    req.body.blog.likes = 0;
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        } else {
    //then, redirect to the index
            res.redirect("/blogs");
        }
    });
});

// SHOW ROUTE
app.get("/blogs/:id", function(req, res) {
    Blog.findById(req.params.id, function (err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            // console.log(user);
            res.render("show", {blog: foundBlog});  
        }
    }); 
});

// EDIT ROUTE
app.get("/blogs/:id/edit" ,function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});  
        }
    });
});

// UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
  //destroy blog
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
});

// LOGIN ROUTE 

app.get("/login",function(req, res){
    res.render("login");
}
);

// LIKE ROUTE

app.post("/blogs/like/:id", function(req, res){
    Blog.findById(req.params.id, function(err, blog){
        if(err){
            console.log(err);
        }
        else {
            blog.likes = blog.likes + 1;
            blog.save();
            res.redirect("/blogs");
        }
    });
});

// COMMENT ROUTE 


app.post("/blogs/comment/:id", function (req, res) {
    Blog.findById(req.params.id, function (err, blog) {
        if (err) {
            console.log(err);
        }
        else {
            // req.body.comment.name = req.user.name;
            req.body.comment.name = "Shivam";
            blog.comments.push(req.body.comment);
            blog.save();
            res.redirect("/blogs/"+req.params.id);
        }
    });
});

app.listen(process.env.PORT || 3000, process.env.IP, function () {
    console.log("SERVER IS RUNNING!");
});