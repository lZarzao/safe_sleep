import { Router } from 'express';
import getTokenFromHeader from '../auth/getTokenFromHeader.js';
import Token from '../schema/token.js';
import jsonResponse from '../utilities/jsonResponse.js';

export const signoutRouter = Router();

signoutRouter.delete('/', async (req, res) => {
  try {
    const refreshToken = getTokenFromHeader(req.headers);
    if (refreshToken) {
      await Token.findOneAndDelete({ token: refreshToken });
      res.status(200).json(jsonResponse(200, { message: 'Token deleted' }));
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(jsonResponse(500, { error: 'Server error' }));
  }
});
