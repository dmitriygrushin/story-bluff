module.exports.view = (req, res) => {
    const roomId = req.params.id;
    const username = req.session.username;
    res.render('room', { roomId, username });
}
