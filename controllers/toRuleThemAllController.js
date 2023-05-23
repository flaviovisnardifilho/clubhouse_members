const { prisma } = require("../prisma/index");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const bcrypt = require("bcrypt");

// POST Create an account
exports.createAccount = async (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10)
    .then(async (hash) => {
      const user = await prisma.user.create({
        data: {
          name: req.body.username,
          hash: hash,
        },
      });
    })
    .catch((err) => next(err));
  res.redirect("/");
};

// GET log-in
exports.logIn_GET = (req, res) =>
  res.render("log-in-form", {
    title: "Log in",
  });

// POST log-in
exports.logIn = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/",
});

// GET log-out
exports.logOut = (req, res, next) => {
  req.logout((err) => {
    if (err) next(err);
    res.redirect("/");
  });
};

// GET Home
exports.index = async (req, res, next) => {
  const posts = await prisma.post.findMany({
    // if (res.locals.user){

    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
    // }
  });

  res.render("index", {
    title: "ClubHouse Board",
    post_list: posts,
  });
};

// POST send a message to the board
exports.send_message_POST = async (req, res, next) => {
  const post = await prisma.post.create({
    data: {
      author: {
        connect: {
          id: res.locals.user.id,
        },
      },
      content: req.body.inputMessage,
    },
  });
  res.redirect("/");
  // console.log(res.locals.user);
};

// DELETE a message in the board
exports.delete_message = async (req, res, next) => {
  console.log("===============================");
  console.log("deleting message");
  console.log(req.params.id);

  const deleteMessage = await prisma.post.delete({
    where: {
      id: req.params.id,
    },
  });

  return res.redirect("/");
};

// GET list all users
exports.list_users_GET = async (req, res, next) => {
  const users = await prisma.user.findMany({
    select: {
      name: true,
    },
  });
  res.render("user-list", {
    title: "Users",
    user_list: users,
  });
};
