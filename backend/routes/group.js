import { Router } from 'express';
import jsonResponse from '../utilities/jsonResponse.js';
import Group from '../schema/group.js'; // Asegúrate de importar el modelo correctamente

export const groupRouter = Router();

groupRouter.post('/', async (req, res) => {
  const { babyId, parentId } = req.body;

  try {
    const newGroup = new Group({ babyId, parentId });
    await newGroup.save();

    res.status(201).json(jsonResponse(201, { message: 'Group created successfully', group: newGroup }));
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json(jsonResponse(409, { error: 'A group with the same baby and parent already exists' }));
    } else {
      res.status(500).json(jsonResponse(500, { error: 'Internal server error' }));
    }
  }
});


groupRouter.delete('/:groupId', async (req, res) => {
  const { groupId } = req.params;

  try {
    const result = await Group.findByIdAndDelete(groupId);

    if (!result) {
      return res.status(404).json(jsonResponse(404, { message: 'Group not found' }));
    }

    res.status(200).json({ message: 'Group deleted successfully' });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      res.status(400).json(jsonResponse(400, { error: 'Invalid group ID' }));
    } else {
      res.status(500).json(jsonResponse(500, { error: 'Internal server error' }));
    }
  }
});


groupRouter.get('/:stationId', async (req, res) => {
  const { stationId } = req.params;

  try {
    const groups = await Group.find({ $or: [{ babyId: stationId }, { parentId: stationId }] })
      .populate({
        path: 'parentId',
        populate: { path: 'parentId', model: 'User' },
      })
      .populate({
        path: 'babyId',
        populate: { path: 'parent', model: 'User' },
      });

    if (groups.length > 0) {
      res.status(200).json(jsonResponse(200, { message: 'This is your group', groups }));
    } else {
      res.status(404).json(jsonResponse(404, { message: 'Group not found' }));
    }
  } catch (error) {
    res.status(500).json(jsonResponse(500, { error: 'Internal server error' }));
  }
});
