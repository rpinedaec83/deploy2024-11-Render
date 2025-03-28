const db = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = db.user;
const Role = db.role;

exports.signup = (req, res) => {
  try {
    let password = bcrypt.hashSync(req.body.password, 8);

    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: password,
    });
    user.save((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      if (req.body.roles) {
        Role.find(
          {
            name: { $in: req.body.roles },
          },
          (err, roles) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
            user.roles = roles.map((role) => role._id);
            user.save((err) => {
              if (err) {
                res.status(500).send({ message: err });
                return;
              }
              res.send({ message: "Usuario Creado Correctamente" });
            });
          }
        );
      } else {
        Role.findOne({ name: "user" }, (err, role) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          console.log(role);
          user.roles = [role._id];
          user.save((err) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
            res.send({ message: "Usuario Creado Correctamente" });
          });
        });
      }
    });
  } catch (err) {
    console.log(err);
  }
};

exports.signin = (req, res) => {
  User.findOne({ username: req.body.username })
    .populate("roles", "__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      if (!user) {
        res.status(404).send({ message: "Usuario no encontrado" });
        return;
      }
      let passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (!passwordIsValid) {
        res.status(401).send({ message: "Password Invalido" });
        return;
      }
      const token = jwt.sign({ id: user.id }, process.env.jwtSecret, {
        algorithm: "HS256",
        allowInsecureKeySizes: true,
        expiresIn: 86400,
      });
      let authorities = [];
      for (let index = 0; index < user.roles.length; index++) {
        const element = user.roles[index];
        authorities.push(element);
      }
      req.session.token = token;
      res.status(200).send({
        id: user.id,
        username: user.username,
        email: user.email,
        roles: authorities,
      });
    });
};

exports.signout = async (req, res) => {
  try {
    req.session = null;
    res.status(200).send({ message: "Tu session ha terminado" });
  } catch (error) {
    this.next(error);
  }
};
