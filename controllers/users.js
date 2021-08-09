var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
const User = require("../models/User");
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
var pass = process.env.USER_PASSWORD;
var emailID = process.env.USER_EMAILID;

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res) => {
  try {
    // Get user input
    const { username, email, password } = req.body;

    // Validate user input
    if (!(username && email && password)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      username,
      email,
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, username },
      process.env.TOKEN_KEY
    );
    // save user token
    user.token = token;
    // console.log(res.locals.userData);
    user.save();
    // console.log(token);
    res.cookie("cookietokenkey", token, {
      httpOnly: true,
      secure: true,
      maxAge: 3600 * 60 * 60 * 24,
    });
    res.redirect("/");

    // console.log(req.cookies.cookietokenkey._id);
  } catch (err) {
    console.log(err);
  }
};

module.exports.renderLogin = async (req, res) => {
  res.render("users/login");
};

module.exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username: username });
    if (user) {
      //check if same passwords match
      const match = await bcrypt.compare(password, user.password);
      console.log(match);
      if (match) {
        const token = jwt.sign(
          { user_id: user._id, username },
          process.env.TOKEN_KEY
        );
        // save user token
        user.token = token;
        user.save();
        // console.log(token);
        res.cookie("cookietokenkey", token, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 60 * 60 * 24,
        });
        res.redirect("/");
        // console.log(jwtmatch);
      } else {
        console.log("invalid");
      }
    } else {
      return res.status(400).send({ error: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).send({ error: "server error" });
  }
};

module.exports.renderForgotPassword = (req, res) => {
  res.render("users/forgotPassword");
};

module.exports.emailVerification = function (req, res, next) {
  async.waterfall(
    [
      //functions are first class objects, can pass the values around
      function (done) {
        crypto.randomBytes(20, function (err, buf) {
          var token = buf.toString("hex");
          done(err, token);
        });
      },
      function (token, done) {
        User.findOne({ email: req.body.email }, function (err, user) {
          if (!user) {
            return res.redirect("/forgotPassword");
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function (err) {
            done(err, token, user);
          });
        });
      },
      function (token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: emailID,
            pass: pass,
          },
        });
        var mailOptions = {
          to: user.email,
          from: emailID,
          subject: "Node.js Password Reset",
          text:
            "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
            "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
            "http://" +
            req.headers.host +
            "/reset/" +
            token +
            "/email" +
            "\n\n" +
            "If you did not request this, please ignore this email and your password will remain unchanged.\n",
        };
        smtpTransport.sendMail(mailOptions, function (err) {
          console.log("mail sent");

          done(err, "done");
        });
      },
    ],
    function (err) {
      if (err) return next(err);
      res.redirect("/forgotPassword");
    }
  );
};

module.exports.renderToken = function (req, res) {
  User.findOne(
    {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    },
    function (err, user) {
      if (!user) {
        return res.redirect("/forgotPassword");
      }
      res.render("users/resetByEmail", { token: req.params.token });
    }
  );
};

module.exports.changePassword = function (req, res) {
  async.waterfall(
    [
      function (done) {
        User.findOne(
          {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() },
          },
          async function (err, user) {
            if (!user) {
              return res.redirect("/forgotPassword");
            }
            if (req.body.password === req.body.confirm) {
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;

              encryptedPassword = await bcrypt.hash(req.body.password, 10);

              const token = jwt.sign(
                { user_id: user._id, username: user.username },
                process.env.TOKEN_KEY
              );
              // save user token
              user.token = token;
              user.password = encryptedPassword;
              user.save();
              // console.log(token);
              res.cookie("cookietokenkey", token, {
                httpOnly: true,
                secure: true,
                maxAge: 3600 * 60 * 60 * 24,
              });
              res.redirect("/");
            } else {
              return res.redirect("/home");
            }
          }
        );
      },
      function (user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: emailID,
            pass: pass,
          },
        });
        var mailOptions = {
          to: user.email,
          from: emailID,
          subject: "Your password has been changed",
          text:
            "Hello,\n\n" +
            "This is a confirmation that the password for your account " +
            user.email +
            " has just been changed.\n",
        };
        smtpTransport.sendMail(mailOptions, function (err) {
          done(err);
        });
      },
    ],
    function (err) {
      res.redirect("/");
    }
  );
};

module.exports.logout = (req, res) => {
  return res.clearCookie("cookietokenkey").redirect("/home");
};
