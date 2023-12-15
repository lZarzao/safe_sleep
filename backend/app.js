import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketIO } from 'socket.io';

import { signupRouter } from './routes/signup.js';
import { loginRouter } from './routes/login.js';
import { userRouter } from './routes/user.js';
import { refreshTokenRouter } from './routes/refreshToken.js';
import { signoutRouter } from './routes/signout.js';
import { babyRouter } from './routes/baby.js';
import { parentRouter } from './routes/parent.js';
import { groupRouter } from './routes/group.js';

import mongoose from 'mongoose';
import authenticate from './auth/authenticate.js';

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

global.io = io;

dotenv.config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

async function main() {
  await mongoose.connect(process.env.DB);
  console.log('Connected to MongoDB');
}

main().catch(console.error);

app.use('/api/signup', signupRouter);
app.use('/api/login', loginRouter);
app.use('/api/user', authenticate, userRouter);
app.use('/api/refresh-token', refreshTokenRouter);
app.use('/api/signout', signoutRouter);
app.use('/api/baby', babyRouter);
app.use('/api/parent', parentRouter);
app.use('/api/group', groupRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

import Parent from './schema/parent.js';
import Group from './schema/group.js';
import Baby from './schema/baby.js';

// Socket.IO event handling
io.on('connection', (socket) => {
  console.log('He recibido una solicitud', socket.id);
  socket.emit('me', socket.id);

  socket.on('disconnect', async () => {
    socket.broadcast.emit('callEnded');
    try {
      const updatedParent = await Parent.findOneAndUpdate({ socketId: socket.id }, { socketId: '' }, { new: true });
      if (updatedParent) {
        console.log('Socket ID eliminado de Parent:', socket.id);

        const group = await Group.findOne({ parentId: updatedParent._id }).populate('babyId');
        if (group) {
          const baby = await Baby.findById(group.babyId._id);
          if (baby && baby.socketId) {
            // Emitir evento al socketId de BabyStatoin
            global.io
              .to(baby.socketId)
              .emit('SocketIdUpdated', { parent: updatedParent._id, socketId: updatedParent.socketId });
          }
        } 
      }


      const updatedBaby = await Baby.findOneAndUpdate({ socketId: socket.id }, { socketId: '' }, { new: true });
      if (updatedBaby) {
        console.log('Socket ID eliminado de Baby:', socket.id);

        const group = await Group.findOne({ babyId: updatedBaby._id }).populate('parentId');
        if (group) {
          const parent = await Parent.findById(group.parentId._id);
          if (parent && parent.socketId) {
            // Emitir evento al socketId de Parent
            global.io
              .to(parent.socketId)
              .emit('SocketIdUpdated', { baby: updatedBaby._id, socketId: updatedBaby.socketId });
          }
        }
      }


      if (!updatedParent && !updatedBaby) {
        console.log('Socket ID no encontrado en Parent ni Baby:', socket.id);
      }
    } catch (error) {
      console.error('Error al actualizar Parent o Baby', error);
    }
    console.log('Se cierra la conexión');
  });

  socket.on('callUser', ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit('callUser', { signal: signalData, from, name });
  });

  socket.on('answerCall', (data) => {
    io.to(data.to).emit('callAccepted', data.signal);
  });

  socket.on('endCall', ({ to }) => {
    console.log('se fue el vento papu', to)
    io.to(to).emit('endCall');
  });
});

server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
