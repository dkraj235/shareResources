const express = require("express");
const bodyParser = require("body-parser")
const ejs = require('ejs');
const multer  = require('multer') ;
const  mongoose = require("mongoose");
// const pdfkit = require("pdfkit")
const path = require('path');
// const fs = require("fs");
const md5 = require("md5");
const session  = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const app = express();
mongoose.set('strictQuery', false);
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + '/public'));

// mongoose.connect("mongodb://0.0.0.0:27017/rscDB");


app.use(session({
  secret: "ALl secret of the UNIVERSE",
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://admin-dilip:dilip123@cluster0.nwdwxrb.mongodb.net/shareDB",
 {
    useNewUrlParser: true,
    useUnifiedTopology: true
 });
// mongodb://127.0.0.1:27017/rscDB

// mongoose.connect("mongodb://0.0.0.0:27017/userDB");


const userSchema =new  mongoose.Schema({
  userName:{
    type:String
  },
  userPassword:{
    type:String
  }
});

userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("user", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

const collegueSchema = new mongoose.Schema({
  colleguename: {
    type:String
  },
  colleguesession:{
    type:String
  },
colleguecollege:{
      type:String
    },
colleguecontacturl:{
    type:String
  },
  collegueimg:{
    data: Buffer,
    type:String
  }
});

const resourceSchema = {
  branch:{
    type:String
  },
  semester:{
    type:String
  },
  fileTitle: {
    type:String
  },
  pdf:{
    data: Buffer,
    type:String
  },
  fileUploaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
};


const userMessageSchema = {
  name:{
    type:String
  },
  email:{
    type:String
    // required:true
  },
  message:{
    type:String
    // required:true
  }
}

const Usermessage = mongoose.model("usermessage", userMessageSchema);
const Resource = mongoose.model("resource", resourceSchema);
const Collegue  = mongoose.model("collegue", collegueSchema);

const storage = multer.diskStorage({
  destination: function(req,file, cb) {
    cb(null, './public/uploads/');
  },

  filename: function (req, file, cb) {
     cb(null, Date.now() + "-" + file.originalname); //upload pdf || image

  }
});

// const uploadme = multer({ storage: storage }).single('userimage');
const upload = multer({ storage: storage }).single('collegueimg');
const uploadpdfimg = multer({ storage: storage }).single('pdffile');

// testing


app.get("/", function(req, res){
   res.render("home");
});

app.get("/sharenotes", function(req, res) {
  if(req.isAuthenticated()){
    res.render("sharenotes");
  } else {
    res.redirect("/login");
  }
});

app.get("/register", function(req, res) {
 res.render("register");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/logout", function(req, res){
  res.redirect("/");
});

app.post("/logout", function(req, res) {
  req.logout();
  res.redirect("/");

});

app.post("/register", function(req, res) {
  User.register({username: req.body.username},  req.body.password, function(err, user) {
    if(err) {
      console.log(err);
      res.redirect("/register")
    } else {
      passport.authenticate("local") (req, res, function() {
        res.redirect("/sharenotes");
      });
    }
  });


     });

app.post("/login", function(req, res) {

  const user = new User({
    userName: req.body.username,
    userPassword: req.body.password
  });

  req.login(user, function(err) {
    if(err) {
      console.log(err);
    } else {
      passport.authenticate("local") (req, res, function() {
        res.redirect("/sharenotes");
      });
    }

  })
  });


app.get("/resources", function(req, res){
Resource.find({}, function(err, foundFiles){
  if(foundFiles) {
    res.render("resources", {allfiles: foundFiles});
  } else {
    console.log(err);
  }
});
});


 //  ------------------------------------------------------ render all-collegues ------------------------------------------
app.get("/collegues", function(req, res){
  Collegue.find({}, function(err, foundCollugues){
    if(foundCollugues) {
      res.render("collegues", {allCollegues: foundCollugues});
    } else {
      console.log(err);
    }
  });
});


app.get("/cse", function(req, res){

  Resource.find({branch:"cse"}, function(err, cseFiles){
    if(cseFiles) {
      // res.json(cseFiles);
      res.render("cse", {allCseFiles: cseFiles});
      // console.log(cseFiles);
    } else {
      console.log(err);
    }
  });

});


app.get("/ele", function(req, res){
  Resource.find({branch:"ele"}, function(err, eleFiles){
    if(eleFiles) {
      res.render("ele", {allEleFiles: eleFiles});
      // console.log(cseFiles);
    } else {
      console.log(err);
    }
  });
});

app.get("/ece", function(req, res){
  Resource.find({branch:"ece"}, function(err, eceFiles){
    if(eceFiles) {
      res.render("ece", {allEceFiles: eceFiles});
      // console.log(cseFiles);
    } else {
      console.log(err);
    }
  });
});

app.get("/mech", function(req, res){
  Resource.find({branch:"mech"}, function(err, mechFiles){
    if(mechFiles) {
      res.render("mech", {allMechFiles: mechFiles});
      // console.log(cseFiles);
    } else {
      console.log(err);
    }
  });
});

app.get("/auto", function(req, res){
  Resource.find({branch:"auto"}, function(err, autoFiles){
    if(autoFiles) {
      res.render("auto", {allAutoFiles: autoFiles});
      // console.log(cseFiles);
    } else {
      console.log(err);
    }
  });
});

app.get("/civil", function(req, res){
  Resource.find({branch:"civil"}, function(err, civilFiles){
    if(civilFiles) {
      res.render("civil", {allCiviilFiles: civilFiles});
      // console.log(cseFiles);
    } else {
      console.log(err);
    }
  });
});



app.post("/myresource", uploadpdfimg, function(req, res) {
const requestsemester = req.body.semester ;
const requestBranch = req.body.branch ;
const requestTitle = req.body.title ;
const requestFile  = req.file.filename;
// for imageg that's why file.fileName file is input name

const newResource = new Resource ({
branch:requestBranch,
semester:requestsemester,
fileTitle:requestTitle,
pdf:requestFile
});

// return res.json({status:"ok", uploaded:req.files.length});
newResource.save(function(err) {
  if(!err) {
  console.log("saved");
} else {
  console.log(err);
}
});
// res.redirect("/");
res.render("uploaded");
});


app.post("/contactus", function(req, res) {
  const newUserMessage = new Usermessage ({
    name:req.body.dn,
    email:req.body.de,
    message:req.body.dm
  });

  newUserMessage.save(function(err) {
    if(!err) {
      console.log(newUserMessage);
    }else {
      console.log(err);
    }ss
  })
  res.redirect("/");

});


app.get("/createnewcollegue", function(req, res) {
  res.render("createnewcollegues");
})


// post method for collegues

app.post("/createnewcollegue",  upload, function(req, res) {
// const requserYourname = req.body.colleguename;
// const requserSession = req.body.colleguesession;
// const requserCollege = req.body.colleguecollege;
// const requserImage = req.file.filename;


  const newCollegue = new Collegue({
  colleguename: req.body.colleguename,
  colleguesession: req.body.colleguesession,
  colleguecollege: req.body.colleguecollege,
  collegueimg: req.file.filename,
  colleguecontacturl:req.body.colleguecontacturl
})


  newCollegue.save(function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("saved");
    }
  });
  res.redirect("/collegues")
});


// process.env.PORT ||
app.listen(3000,function(){
    console.log("i'm using port 3000");
});
