import { Router } from 'express';
import jsonResponse from '../utilities/jsonResponse.js';
import User from '../schema/user.js';
import getUserInfo from '../utilities/getUserInfo.js';

export const loginRouter = Router();

loginRouter.post('/', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json(
      jsonResponse(400, {
        error: 'Fields are required',
      })
    );
  }

  const user = await User.findOne({ username });

  if (user) {
    const correctPassword = await user.comparePassword(password, user.password);
    if (correctPassword) {
      //Autenticar usuario
      const accessToken = user.createAccessToken();
      const refreshToken = await user.createRefreshToken();
      res.status(200).json(
        jsonResponse(200, {
          user: getUserInfo(user),
          accessToken,
          refreshToken,
        })
      );
    } else {
      res.status(400).json(
        jsonResponse(400, {
          error: 'User or password incorrect',
          user: null,
        })
      );
    }
  } else {
    res.status(400).json(
      jsonResponse(400, {
        error: 'User not found',
        user: null,
      })
    );
  }
});