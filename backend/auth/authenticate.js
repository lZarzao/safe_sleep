import jsonResponse from '../utilities/jsonResponse.js';
import getTokenFromHeader from './getTokenFromHeader.js';
import { verifyAccessToken } from './verifyTokens.js';

const authenticate = (req, res, next) => {
  const token = getTokenFromHeader(req.headers);

  if (token) {
    const decoded = verifyAccessToken(token);
    if (decoded) {
      req.user = { ...decoded.user };
      next();
    } else {
      res.status(401).json(
        jsonResponse(401, {
          message: 'No token provided',
        })
      );
    }
  } else {
    res.status(401).json(
      jsonResponse(401, {
        message: 'No token provided',
      })
    );
  }
};

export default authenticate;
