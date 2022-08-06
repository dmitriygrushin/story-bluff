module.exports.view = (req, res) => {
    const roomId = req.params.id;
    const username = req.session.username;
    const isModerator = req.session.isModerator;
    res.render('room', { roomId, username, isModerator });
}

module.exports.joinRoom = (req, res) => {
    const { username } = req.body;
    const { id } = req.params;
    req.session.regenerate((err) => {
        if (err) next(err);
        req.session.username = username;
        req.session.isModerator = false;
        req.session.roomId = id;
        req.session.save((err) => {
            if (err) return next(err);
            res.redirect(`/${id}`);
        });
    })
}