module.exports.view = (req, res) => {
    const roomId = req.params.id;
    res.render('room', { roomId });
}
