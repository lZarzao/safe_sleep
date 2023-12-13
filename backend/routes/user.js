import { Router } from 'express';
import jsonResponse from '../utilities/jsonResponse.js';

export const userRouter = Router();

userRouter.get('/', (req, res) => {
  res.status(200).json(jsonResponse(200, req.user));
});
