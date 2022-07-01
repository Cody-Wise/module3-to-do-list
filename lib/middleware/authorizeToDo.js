const ToDo = require('../models/ToDo');

module.exports = async (req, res, next) => {
  try {
    const toDo = await ToDo.getById(req.params.id);
    if (!toDo || toDo.user_id !== req.user.id)
      throw new Error('You do not have permission to do that');
    next();
  } catch (e) {
    e.status = 403;
    next(e);
  }
};
