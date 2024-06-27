const express = require('express');
const router = express.Router();
const Room = require('../models/room');

router.get("/", (req, res) => {
    res.render("index", { isAuthenticated: req.session.userId !== undefined });
});

router.get("/rooms", async (req, res) => {
    try {
        const findelement = await Room.find();
        console.log("data found", findelement);
        res.render("rooms", { posts: findelement, isAuthenticated: req.session.userId !== undefined });
    } catch (error) {
        console.log(error);
    }
});

router.get("/read_more", (req, res) => {
    res.render("read_more");
});

module.exports = router;
