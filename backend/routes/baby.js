import { Router } from 'express';
import jsonResponse from '../utilities/jsonResponse.js';
import Baby from '../schema/baby.js';
import Parent from '../schema/parent.js';
import Group from '../schema/group.js';

export const babyRouter = Router();

babyRouter.post('/', async (req, res) => {
  const { name, gender, birthDate, parentId, socketId } = req.body;

  try {
    const newBaby = new Baby({ name, gender, birthDate, parent: parentId, socketId });
    await newBaby.save();

    res.status(201).json(
      jsonResponse(201, {
        message: 'Baby created successfully',
        baby: newBaby,
      })
    );
  } catch (error) {
    res.status(500).json(
      jsonResponse(500, {
        error: 'Error creating baby',
      })
    );
  }
});

babyRouter.get('/:parentId', async (req, res) => {
  try {
    const { parentId } = req.params;
    const baby = await Baby.findOne({ parent: parentId });

    if (baby) {
      res.status(200).json(jsonResponse(200, { hasBaby: true, baby }));
    } else {
      res.status(200).json(jsonResponse(200, { hasBaby: false }));
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


babyRouter.patch('/:babyId', async (req, res) => {
  const { babyId } = req.params;
  const { socketId } = req.body;

  try {
    const baby = await Baby.findOneAndUpdate({ _id: babyId }, { socketId }, { new: true });
    if (!baby) {
      return res.status(404).json(jsonResponse(404, { message: 'Baby not found' }));
    }

    // Emitir evento de Socket.IO
    const group = await Group.findOne({ babyId: baby._id }).populate('parentId');
    if (group) {
      const parent = await Parent.findById(group.parentId._id);
      if (parent && parent.socketId) {
        // Emitir evento al socketId de Parent
        global.io.to(parent.socketId).emit('SocketIdUpdated', { baby: baby._id, socketId: baby.socketId });
      }
    }

    res.status(200).json(jsonResponse(200, { message: 'Baby updated successfully', baby }));
  } catch (error) {
    res.status(500).json(jsonResponse(500, { error: 'Internal server error' }));
  }
});