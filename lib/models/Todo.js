const pool = require('../utils/pool');

module.exports = class ToDo {
  id;
  user_id;
  task;
  completed;

  constructor(row) {
    this.id = row.id;
    this.user_id = row.user_id;
    this.task = row.task;
    this.completed = row.completed;
  }

  static async getAll(user_id) {
    const { rows } = await pool.query(
      `SELECT *
      FROM todos
      WHERE user_id=$1
      ORDER BY created_at DESC`,
      [user_id]
    );

    return rows.map((row) => new ToDo(row));
  }

  static async insert({ user_id, task, completed }) {
    const { rows } = await pool.query(
      `INSERT INTO todos (user_id, task, completed)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [user_id, task, completed]
    );

    return new ToDo(rows[0]);
  }

  static async getById(id) {
    const { rows } = await pool.query(
      `SELECT *
      FROM todos
      WHERE id = $1`,
      [id]
    );

    if (!rows[0]) return null;

    return new ToDo(rows[0]);
  }

  static async updateById(id, attrs) {
    const toDo = await ToDo.getById(id);

    if (!toDo) return null;

    const { task, completed } = { ...toDo, ...attrs };

    const { rows } = await pool.query(
      `UPDATE todos
      SET task=$1, completed=$2
      WHERE id=$3
      RETURNING *`,
      [task, completed, id]
    );

    return new ToDo(rows[0]);
  }

  static async delete(id) {
    const { rows } = await pool.query(
      `DELETE
      FROM todos
      WHERE id=$1
      RETURNING *`,
      [id]
    );

    return new ToDo(rows[0]);
  }
};
