// Load module
var mysql = require('mysql');
// Initialize pool
var pool      =    mysql.createPool({
    host     : '192.168.1.15',
    user     : 'root',
    password : 'password',
    database : 'oracle_code_chatbot',
    connectionLimit : 10,
    waitForConnections:false,
    debug    :  false
});    


function getPool() {
  return pool;
}
module.exports.getPool = getPool;