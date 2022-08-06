// get
module.exports.view = (req, res) => {
    res.render('index');
}

// post
module.exports.createRoom = (req, res) => {
    const { username, room_id } = req.body;
    req.session.regenerate((err) => {
        if (err) next(err);
        req.session.username = username;
        req.session.isModerator = true;
        req.session.roomId = room_id;
        req.session.save((err) => {
            if (err) return next(err);
            res.redirect(`/${room_id}`);
        });
    })
}

