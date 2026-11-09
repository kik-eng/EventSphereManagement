const attendeeOnly = (req, res, next) => {
    if (req.user && req.user.role === 'attendee') {
        return next();
    }

    return res.status(403).json({
        message: 'Access denied. Attendee only.'
    });
};

module.exports = { attendeeOnly };