var mysql = require('mysql');
var Promise = require('bluebird');

var inventoryUpdate = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'inventory'
});

inventoryUpdate.connect();
var connection = Promise.promisifyAll(inventoryUpdate);

const addCategory = (params) => {
  return connection.queryAsync(
    `insert into category (id, name, parent_id) values (?, ?, ?)`, params)
  .then(success => success)
  .catch((err) => {
    console.error(err);
    return err;
  })
};

const addSeller = (params) => {
  console.log('these are params', params);
  return connection.queryAsync(
    `insert into seller (id, name) values (?, ?)`, params)
  .then(success => success)
  .catch((err) => {
    console.error(err);
    return err;
  })
};

module.exports = {
  addCategory,
  addSeller
};