const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const md5 = require('md5');
const dotenv = require('dotenv').config()

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://127.0.0.1:27017/myhotel", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Configure session management
app.use(session({
    secret: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 } // Optional: Set session cookie expiration
}));

function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    } else {
        res.redirect('/user_login');
    }
}

const adminschema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
    }
});
const admin = mongoose.model('admin', adminschema);

app.get("/", function(req, res) {
    res.render("index" , { isAuthenticated: req.session.userId !== undefined });
});
app.get("/login", function(req, res) {
    res.render("login");
});
app.get("/rooms", async function(req, res) {
    try {
        const findelement = await rooms.find();
        console.log("data found", findelement);
        res.render("rooms", { posts: findelement , isAuthenticated: req.session.userId !== undefined });
    } catch (error) {
        console.log(error);
    }
});
app.get("/read_more", function(req, res) {
    res.render("read_more");
});
app.get("/admin", function(req, res) {
    res.render("main");
});

app.get("/register", function(req, res) {
    res.render("register");
});
app.get("/login", function(req, res) {
    res.render("login");
});
app.get("/logout", function(req, res) {
    res.render("main");
});

app.post("/register", async function(req, res) {
    try {
        const user = new admin({
            email: req.body.email,
            password: md5(req.body.password)
        });
        await user.save();
        res.render("login");
    } catch (error) {
        console.log(error);
    }
});

app.post("/login", async function(req, res) {
    const username = req.body.email;
    const password = md5(req.body.password);
    try {
        const find = await admin.findOne({ email: username });
        if (find) {
            if (find.password === password) {
                res.render("dashboard", { name: username });
            } else {
                res.render("login");
                console.log("login error spotted");
            }
        }
    } catch (error) {
        console.log(error);
    }
});



// User routes
app.get("/user_register", function(req, res) {
    res.render("user_register", { error: " " });
});
app.get("/user_login", function(req, res) {
    res.render("user_login");
});
app.get("/userlogout", function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
            res.redirect('/'); 
        } else {
            res.redirect('/user_login'); 
        }
    });
});

const userschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    bookings: [{
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'rooms'
        },
        numofdays: Number,
        totalAmount: Number
    }]
});
const UserModel = mongoose.model('users', userschema);

app.post("/userregister", async function(req, res) {
    if (req.body.password === req.body.confirmpassword) {
        try {
            const user = new UserModel({
                name: req.body.name,
                email: req.body.email,
                password: md5(req.body.password)
            });
            await user.save();
            res.render("user_login");
        } catch (error) {
            console.log(error);
        }
    } else {
        console.log("Both passwords do not match.");
        res.render("user_register", { error: "Password Doesn't Match !" });
    }
});

app.get("/user_profile", isAuthenticated, async function(req, res) {
    try {
        const user = await UserModel.findById(req.session.userId).populate('bookings.roomId');
        res.render("user_profile", { name: user.name, bookings: user.bookings });
    } catch (err) {
        console.log(err);
        res.redirect('/user_login');
    }
});

app.post("/userlogin", async function(req, res) {
    const username = req.body.email;
    const password = md5(req.body.password);

    try {
        const user = await UserModel.findOne({ email: username });
        if (user && user.password === password) {
            req.session.userId = user._id;

            // Fetching user bookings
            const userWithBookings = await UserModel.findById(user._id).populate('bookings.roomId');

            res.render("user_profile", { name: userWithBookings.name, bookings: userWithBookings.bookings });
        } else {
            console.log("Login failed: invalid credentials");
            res.redirect('/user_login');
        }
    } catch (error) {
        console.log(error);
        res.redirect('/user_login');
    }
});

app.post("/booknow", isAuthenticated, async function(req, res) {
    const roomId = req.body.bookbutton;
    const numofdays = req.body.days;

    try {
        const room = await rooms.findById(roomId);
        const user = await UserModel.findById(req.session.userId);

        if (room && user) {
            const totalAmount = room.amount * numofdays;

            user.bookings.push({
                roomId: room._id,
                numofdays: numofdays,
                totalAmount: totalAmount
            });

            await user.save();

            // Fetching updated bookings
            const updatedUser = await UserModel.findById(req.session.userId).populate('bookings.roomId');

            res.render('user_profile', { name: updatedUser.name, bookings: updatedUser.bookings });
        } else {
            res.render('user_profile', { name: user.name, bookings: [] });
        }
    } catch (error) {
        console.log(error);
    }
});

app.get("/adminrooms", function(req, res) {
    res.render('ad_rooms.ejs');
});

const roomschema = new mongoose.Schema({
    link: String,
    type: String,
    bed: Number,
    bathroom: Number,
    balcony: Number,
    sofa: Number,
    adult: Number,
    children: Number,
    amount: Number
});
const rooms = mongoose.model('rooms', roomschema);

app.post("/addroom", async function(req, res) {
    const room = new rooms({
        link: req.body.link,
        type: req.body.name,
        bed: req.body.bed,
        bathroom: req.body.bathroom,
        balcony: req.body.balcony,
        sofa: req.body.sofa,
        adult: req.body.adults,
        children: req.body.children,
        amount: req.body.amount
    });
    await room.save();
    res.render("ad_rooms.ejs");
});


app.listen(3000, () => {
    console.log("Server listening on port 3000");
});