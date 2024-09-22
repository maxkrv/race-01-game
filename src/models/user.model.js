class User {
  constructor(login, password, full_name, email_address, db) {
    this.login = login;
    this.password = password;
    this.full_name = full_name;
    this.email_address = email_address;
    this.db = db;
  }

  saveToDatabase = async () => {
    const sql =
      "INSERT INTO users (login, password, full_name, email_address, avatar_path) VALUES (?, ?, ?, ?, ?)";
    const url = "icons/default_icon.png";
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
  };

  static findUserByLoginAndPassword = async (login, password, db) => {
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
  };

  static findUserByEmail = async (email, db) => {
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
  };
}

module.exports = User;
