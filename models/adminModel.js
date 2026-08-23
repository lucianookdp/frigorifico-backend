const db = require("../config/db");

const getAdminByEmail = (email, callback) => {
  const query = "SELECT * FROM administradores WHERE email = ?";
  db.query(query, [email], callback);
};

module.exports = {
  getAdminByEmail,
};
