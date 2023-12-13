import jwt from 'jsonwebtoken';

const sign = (payload, isAccessToken) => {
  return jwt.sign(payload, isAccessToken ? process.env.ACCESS_TOKEN_SECRET : process.env.REFRESH_TOKEN_SECRET, {
    algorithm: 'HS256',
    expiresIn: 3600,
  });
};

const generateAccessToken = (user) => {
  return sign({ user }, true);
};

const generateRefreshToken = (user) => {
  return sign({ user }, false);
};

export { generateAccessToken, generateRefreshToken };