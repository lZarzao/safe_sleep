import { Router } from 'express';
import jsonResponse from '../utilities/jsonResponse.js';
import getUserInfo from '../utilities/getUserInfo.js';
import User from '../schema/user.js';

export const userRouter = Router();

userRouter.get('/', (req, res) => {
  res.status(200).json(jsonResponse(200, req.user));
});

userRouter.get('/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json(jsonResponse(404, { message: 'User not found' }));
    }

    res.status(200).json(jsonResponse(200, { user: getUserInfo(user) }));
  } catch (error) {
    res.status(500).json(jsonResponse(500, { error: 'Internal server error' }));
  }
});
