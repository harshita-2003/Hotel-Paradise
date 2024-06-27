const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Admin = require('../models/admin');

router.get("/login", (req, res) => {
    res.render("login");
});

router.get("/admin", (req, res) => {
    res.render("main");
});

router.get("/register",(req,res)=>{
    res.render("register")
})

router.post("/register", async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new Admin({
            email: req.body.email,
            password: hashedPassword
        });
        await user.save();
        res.render("login");
    } catch (error) {
        console.log(error);
    }
});

router.post("/login", async (req, res) => {
    const username = req.body.email;
    const password = req.body.password;
    try {
        const find = await Admin.findOne({ email: username });
        if (find && await bcrypt.compare(password, find.password)) {
            res.render("dashboard", { name: username });
        } else {
            res.render("login");
            console.log("login error spotted");
        }
    } catch (error) {
        console.log(error);
    }
});

router.get("/adminrooms", (req, res) => {
    res.render('ad_rooms');
});

router.post("/addroom", async (req, res) => {
    const Room = require('../models/room');
    const room = new Room({
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
    res.render("ad_rooms");
});

router.get("/logout",(req,res) =>{
    res.render("main");
})

module.exports = router;
