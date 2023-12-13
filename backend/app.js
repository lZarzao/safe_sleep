import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { signupRouter } from './routes/signup.js';
import { loginRouter } from './routes/login.js';
import { userRouter } from './routes/user.js';
import { todoRouter } from './routes/todo.js';
import { refreshTokenRouter } from './routes/refreshToken.js';
import { signoutRouter } from './routes/signout.js';

import mongoose from 'mongoose';
import authenticate from './auth/authenticate.js';

const app = express();

dotenv.config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

async function main() {
  await mongoose.connect(process.env.DB);
  console.log('Connected to MongoDB');
}

main().catch(console.error)

app.use('/api/signup', signupRouter);
app.use('/api/login', loginRouter);
app.use('/api/user', authenticate, userRouter);
app.use('/api/todo', authenticate, todoRouter);
app.use('/api/refresh-token', refreshTokenRouter);
app.use('/api/signout', signoutRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
