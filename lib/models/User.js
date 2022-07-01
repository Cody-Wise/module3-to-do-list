const pool = require('../utils/pool');

module.exports = class User {
  id;
  email;
  #passwordHash;

  constructor(user) {
    this.id = user.id;
    this.email = user.email;
    this.#passwordHash = user.password_hash;
  }

  static async insert({ email, passwordHash }) {
    const { rows } = await pool.query(
      `insert into users (email, password_hash)
                                                values ($1, $2) returning *`,
      [email, passwordHash]
    );
    return new User(rows[0]);
  }

  static async getByEmail(email) {
    const { rows } = await pool.query('select * from users where email = $1', [
      email,
    ]);
    return new User(rows[0]);
  }

  static async getById(id) {
    const { rows } = await pool.query('select * from users where id=$1', [id]);
    return new User(rows[0]);
  }

  get passwordHash() {
    return this.#passwordHash;
  }
};
