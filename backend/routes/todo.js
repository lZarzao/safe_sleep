import { Router } from 'express';
import jsonResponse from '../utilities/jsonResponse.js';
import Todo from '../schema/todo.js';

export const todoRouter = Router();

todoRouter.get('/', async (req, res) => {
  try {
    const allTodo = await Todo.find({
      idUser: req.user.id,
    });
    if (allTodo) {
      res.json(allTodo);
    } else {
      res.status(404).json(jsonResponse(400, 'Todo not found'));
    }
  } catch (error) {}
});

todoRouter.post('/', async (req, res) => {
  if (!req.body.title) {
    res.status(400).json(jsonResponse(400, 'Title is required'));
  }

  try {
    const todo = new Todo({
      title: req.body.title,
      completed: false,
      idUser: req.user.id,
    });

    const newTodo = await todo.save();
    res.json(newTodo);
  } catch (error) {
    console.log(error);
  }
});
