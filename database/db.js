const secret = require('../secret.js');
const mysql = require('mysql');
const connection = mysql.createConnection({
  host: secret.endpoint,
  port: secret.sql_port, 
  user: secret.uname,
  password: secret.passkey,
  database: secret.db_name
});

connection.connect(function (err) {
  if (err) throw err;
});

module.exports = connection;