module.exports.isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).json({ msg: "Login to send a message" });
  }
};

module.exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  } else {
    res
      .status(401)
      .json({ msg: "you are not authorized to view this resource" });
  }
};
