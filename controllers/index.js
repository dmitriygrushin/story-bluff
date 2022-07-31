// get
module.exports.view = (req, res) => {
    res.render('index', { title: 'Express' });
}

// post
module.exports.create = (req, res) => {
    const { name, roomId } = req.body;
    res.redirect(`/room/${roomId}`, { title: 'Express' });
}
