const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = class UserService {
  static async create({ email, password }) {
    try {
      const passwordHash = await bcrypt.hash(
        password,
        Number(process.env.SALT_ROUNDS)
      );

      const user = await User.insert({ email, passwordHash });
      return user;
    } catch (e) {
      e.status = 401;
      throw e;
    }
  }

  static async signIn({ email, password = '' }) {
    try {
      const user = await User.getByEmail(email);

      if (!user) throw new Error('No user with this email');
      if (!bcrypt.compareSync(password, user.passwordHash)) {
        throw new Error('Wrong password!');
      }

      const token = jwt.sign({ ...user }, process.env.JWT_SECRET, {
        expiresIn: '1 day',
      });

      return token;
    } catch (e) {
      e.status = 401;
      throw e;
    }
  }
};
