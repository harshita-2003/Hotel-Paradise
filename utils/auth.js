function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    } else {
        res.redirect('/user_login');
    }
}

module.exports = { isAuthenticated };
