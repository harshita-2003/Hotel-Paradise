const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const dotenv = require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

const db = require('./config/db');
const auth = require('./utils/auth');

const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const indexRoutes = require('./routes/index');

// Configure session management
app.use(session({
    secret: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 }
}));

app.use('/', indexRoutes);
app.use('/', adminRoutes);
app.use('/', userRoutes);

app.listen(3000, () => {
    console.log("⚙️  Server listening on port 3000");
});
