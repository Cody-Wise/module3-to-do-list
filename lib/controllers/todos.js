const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorizeToDo = require('../middleware/authorizeToDo');
const ToDo = require('../models/ToDo');

module.exports = Router()
  .get('/', authenticate, async (req, res, next) => {
    try {
      const toDos = await ToDo.getAll(req.user.id);
      res.json(toDos);
    } catch (e) {
      next(e);
    }
  })
  .post('/', authenticate, async (req, res, next) => {
    try {
      const toDo = await ToDo.insert({ ...req.body, user_id: req.user.id });
      res.json(toDo);
    } catch (e) {
      next(e);
    }
  })
  .put('/:id', authenticate, authorizeToDo, async (req, res, next) => {
    try {
      const toDo = await ToDo.updateById(req.params.id, req.body);
      res.json(toDo);
    } catch (e) {
      next(e);
    }
  })
  .delete('/:id', authenticate, authorizeToDo, async (req, res, next) => {
    try {
      const toDo = await ToDo.delete(req.params.id);
      res.json(toDo);
    } catch (e) {
      next(e);
    }
  });
