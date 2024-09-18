class User {
  constructor(login, password, full_name, email_address, db) {
    this.login = login;
    this.password = password;
    this.full_name = full_name;
    this.email_address = email_address;
    this.db = db;
  }

  async saveToDatabase() {
    const sql =
      "INSERT INTO users (login, password, full_name, email_address, avatar_path) VALUES (?, ?, ?, ?, ?)";
    const url = "avatars/baza.png";
    const values = [
      this.login,
      this.password,
      this.full_name,
      this.email_address,
      url,
    ];

    try {
      const [result] = await this.db.query(sql, values);
      return result;
    } catch (err) {
      console.error("Database error: " + err);
      throw err;
    }
  }

  static async findUserByLoginAndPassword(login, password, db) {
    const sql = "SELECT * FROM users WHERE login = ? AND password = ?";
    const values = [login, password];

    try {
      const [results] = await db.query(sql, values);
      if (results.length === 0) {
        return null;
      }
      return results[0];
    } catch (err) {
      console.error("Database error: " + err);
      throw err;
    }
  }

  static async findUserByEmail(email, db) {
    const sql = "SELECT * FROM users WHERE email_address = ?";
    const values = [email];

    try {
      const [results] = await db.query(sql, values);
      if (results.length === 0) {
        return null;
      }
      return results[0];
    } catch (err) {
      console.error("Database error: " + err);
      throw err;
    }
  }
}

module.exports = User;
