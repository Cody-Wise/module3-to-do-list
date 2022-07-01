const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const UserService = require('../services/UserService');

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;
const IS_DEPLOYED = process.env.NODE_ENV === 'production';

module.exports = Router()
  .get('/me', authenticate, async (req, res) => {
    res.json(req.user);
  })

  .post('/', async (req, res, next) => {
    try {
      const user = await UserService.create(req.body);
      res.json(user);
    } catch (e) {
      next(e);
    }
  })

  .post('/sessions', async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const token = await UserService.signIn({ email, password });

      res
        .cookie(process.env.COOKIE_NAME, token, {
          httpOnly: true,
          secure: IS_DEPLOYED,
          sameSite: IS_DEPLOYED ? 'none' : 'strict',
          maxAge: ONE_DAY_IN_MS,
        })
        .json({ message: 'Signed In!' });
    } catch (e) {
      next(e);
    }
  })

  .delete('/sessions', async (req, res) => {
    res
      .clearCookie(process.env.COOKIE_NAME, {
        httpOnly: true,
        secure: IS_DEPLOYED,
        sameSite: IS_DEPLOYED ? 'none' : 'strict',
        maxAge: ONE_DAY_IN_MS,
      })
      .status(200)
      .send();
  });
