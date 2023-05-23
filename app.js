const createError = require("http-errors");
const express = require("express");
const path = require("path");

const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

require("dotenv").config();

const cookieParser = require("cookie-parser");
const logger = require("morgan");

const indexRouter = require("./routes/routes");

const { prisma } = require("./prisma/index");

/*
 * ----------- APP ------------
 */

const app = express();

/* ----------- VIEWS ----------- */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

app.use(logger("dev"));
app.use(express.json());

/*
 * ----------- SESSION ------------
 */
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    // store:
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

/* ----------- PASSPORT AUTHENTICATION ------------ */
passport.use(
  // new LocalStrategy(customFields, async (username, password, done) => {
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          name: username,
        },
      });

      if (!user) {
        done(null, false, { message: "Incorrect username" });
      }

      bcrypt.compare(password, user.hash, (err, isIdentical) => {
        if (isIdentical) {
          done(null, user);
        } else {
          return done(null, false, { message: "Incorrect password" });
        }
      });
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (userId, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use(passport.initialize());
app.use(passport.session());

/* ----------- CURRENT USER ------------ */
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

/* ----------- ROUTES ------------ */
app.use("/", indexRouter);

/* ----------- 404 AND ERROR HANDLER ------------ */
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
