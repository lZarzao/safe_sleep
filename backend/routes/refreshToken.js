import { Router } from 'express';
import getTokenFromHeader from '../auth/getTokenFromHeader.js';
import jsonResponse from '../utilities/jsonResponse.js';
import Token from '../schema/token.js';
import { verifyRefreshToken } from '../auth/verifyTokens.js';
import { generateAccessToken } from '../auth/generateTokens.js';

export const refreshTokenRouter = Router();

refreshTokenRouter.post('/', async (req, res) => {
  const refreshToken = getTokenFromHeader(req.headers);

  if (refreshToken) {
    try {
      const found = await Token.findOne({ token: refreshToken });
      if (!found) {
        return res.status(401).json(jsonResponse(401, { error: 'Anauthorized' }));
      }
      const payload = verifyRefreshToken(found.token);
      if (payload) {
        const accessToken = generateAccessToken(payload.user);
        return res.status(200).json(jsonResponse(200, { accessToken }));
      } else {
        return res.status(401).json(jsonResponse(401, { error: 'Unauthorized' }));
      }
    } catch (error) {
      return res.status(401).json(jsonResponse(401, { error: 'Unauthorized' }));
    }
  } else {
    res.status(401).send(jsonResponse(401, { error: 'Unauthorized' }));
  }
  res.send('refresh token');
});
