const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const auth = require('../utils/auth');
const Room = require('../models/room');

router.get("/user_register", (req, res) => {
    res.render("user_register", { error: " " });
});

router.get("/user_login", (req, res) => {
    res.render("user_login");
});

router.get("/userlogout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            res.redirect('/');
        } else {
            res.redirect('/user_login');
        }
    });
});

router.post("/userregister", async (req, res) => {
    if (req.body.password === req.body.confirmpassword) {
        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword
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

router.post("/userlogin", async (req, res) => {
    const username = req.body.email;
    const password = req.body.password;

    try {
        const user = await User.findOne({ email: username });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user._id;
            const userWithBookings = await User.findById(user._id).populate('bookings.roomId');
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

router.post("/booknow", auth.isAuthenticated, async (req, res) => {
    const roomId = req.body.bookbutton;
    const numofdays = req.body.days;

    try {
        const room = await Room.findById(roomId);
        const user = await User.findById(req.session.userId);

        if (room && user) {
            const totalAmount = room.amount * numofdays;

            user.bookings.push({
                roomId: room._id,
                numofdays: numofdays,
                totalAmount: totalAmount
            });

            await user.save();

            const updatedUser = await User.findById(req.session.userId).populate('bookings.roomId');

            res.render('user_profile', { name: updatedUser.name, bookings: updatedUser.bookings });
        } else {
            res.render('user_profile', { name: user.name, bookings: [] });
        }
    } catch (error) {
        console.log(error);
    }
});

router.get("/user_profile", auth.isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).populate('bookings.roomId');
        res.render("user_profile", { name: user.name, bookings: user.bookings });
    } catch (err) {
        console.log(err);
        res.redirect('/user_login');
    }
});

module.exports = router;
