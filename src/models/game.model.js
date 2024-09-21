const pool = require("../db/db");

exports.getCard = async () => {
  const sql = "SELECT * FROM cards_web.cards ORDER BY RAND() LIMIT 1";
  const [results] = await pool.query(sql);
  return results.length > 0 ? results[0] : null;
};

exports.getOpponentCard = async (enemyCardId) => {
  const sql = `SELECT * FROM cards_web.cards WHERE id = ?`;
  const [results] = await pool.query(sql, [enemyCardId]);
  return results.length > 0 ? results[0] : null;
};

exports.getAvatarPathByUsername = async (name) => {
  const sql = `SELECT avatar_path FROM cards_web.users WHERE login = ?`;
  const [results] = await pool.query(sql, [name]);
  return results.length > 0 ? results[0] : null;
};
