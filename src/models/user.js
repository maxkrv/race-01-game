class User {
  constructor(login, password, full_name, email_address, db) {
    this.login = login;
    this.password = password;
    this.full_name = full_name;
    this.email_address = email_address;
    this.db = db;
  }

  // Асинхронный метод для сохранения пользователя в базу данных
  async saveToDatabase() {
    const sql =
      "INSERT INTO users (login, password, full_name, email_address) VALUES (?, ?, ?, ?)";
    const url = "avatars/baza.png"; // По умолчанию URL для аватара
    const values = [
      this.login,
      this.password,
      this.full_name,
      this.email_address,
      url,
    ];

    try {
      const [result] = await this.db.query(sql, values);
      console.log("User registered successfully");
      return result;
    } catch (err) {
      console.error("Database error: " + err);
      throw err;
    }
  }

  // Асинхронный метод для поиска пользователя по логину и паролю
  async findUser() {
    const sql = "SELECT * FROM users WHERE login = ? AND password = ?";
    const values = [this.login, this.password];

    try {
      const [results] = await this.db.query(sql, values);

      if (results.length === 0) {
        return null;
      } else {
        return results[0];
      }
    } catch (err) {
      console.error("Database error: " + err);
      throw err;
    }
  }

  // Асинхронный метод для поиска пользователя по email
  static async findUserByEmail(email, db) {
    const sql = "SELECT * FROM users WHERE email_address = ?";
    const values = [email];

    try {
      const [results] = await db.query(sql, values);

      if (results.length === 0) {
        return null;
      } else {
        return results[0];
      }
    } catch (err) {
      console.error("Database error: " + err);
      throw err;
    }
  }
}

module.exports = User;
