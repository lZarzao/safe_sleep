import { Router } from 'express';
import jsonResponse from '../utilities/jsonResponse.js';
import Parent from '../schema/parent.js';
import Group from '../schema/group.js';
import Baby from '../schema/baby.js';

export const parentRouter = Router();

parentRouter.post('/', async (req, res) => {
  const { parentId } = req.body;

  try {
    // Verificar si ya existe un Parent para este usuario
    const parent = await Parent.findOne({ parentId });
    if (parent) {
      return res.status(200).json(jsonResponse(200, { message: 'Parent already exists', parent }));
    }

    // Crear un nuevo Parent
    const newParent = new Parent({ parentId });
    await newParent.save();
    res.status(201).json(jsonResponse(201, { message: 'Parent created successfully', parent }));
    
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


parentRouter.get('/:parentId', async (req, res) => {
  const { parentId } = req.params;
  console.log(parentId)
  try {
    const parent = await Parent.findOne({ parentId });
    console.log(parent)
    if (!parent) {
      return res.status(404).json(jsonResponse(404, { message: 'Parent not found' }));
    }

    res.status(200).json(jsonResponse(200, { parent }));
  } catch (error) {
    if (error.kind === 'ObjectId') {
      res.status(400).json(jsonResponse(400, { error: 'Invalid Parent ID' }));
    } else {
      res.status(500).json(jsonResponse(500, { error: 'Internal server error' }));
    }
  }
});



parentRouter.patch('/:parentId', async (req, res) => {
  const { parentId } = req.params;
  const { socketId } = req.body;

  try {
    const parent = await Parent.findOneAndUpdate({ _id: parentId }, { socketId }, { new: true });
    if (!parent) {
      return res.status(404).json(jsonResponse(404, { message: 'Parent not found' }));
    }

    // Emitir evento de Socket.IO
    const group = await Group.findOne({ parentId: parent._id }).populate('babyId');
    if (group) {
      const baby = await Baby.findById(group.babyId._id);
      if (baby && baby.socketId) {
        // Emitir evento al socketId de Baby
        global.io.to(baby.socketId).emit('SocketIdUpdated', { parent: parent._id, socketId: parent.socketId });
      }
    }

    res.status(200).json(jsonResponse(200, { message: 'Parent updated successfully', parent }));
  } catch (error) {
    res.status(500).json(jsonResponse(500, { error: 'Internal server error' }));
  }
});