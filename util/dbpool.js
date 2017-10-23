// Load module
var mysql = require('mysql');
// Initialize pool
var pool      =    mysql.createPool({
    host     : 'localhost',
    user     : 'root',
    password : 'asdfA9744',
    database : 'oracle_code_chatbot',
    connectionLimit : 10,
    waitForConnections:false,
    debug    :  false
});    


function getPool() {
  return pool;
}
module.exports.getPool = getPool;
