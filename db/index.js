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

// get current inventory
const getInventory = () => {
  return connection.queryAsync(
    // `select id, brand from item`)
    `select * from item`)
  .then(success => success)
  .catch(err => {
    console.error(err);
    return err;
  })
}

// insert seller inventory to seller_item 
const insertSellerItem = (params) => {
  return Promise.all(params.map(param => 
     connection.queryAsync(
      `insert into seller_item set ?`, param)
  ))
  .then(success => success)
  .catch(err => {
    console.error(err);
    return err;
  })
}

// add category to database
// params in format { category: name, parent_id: int }
const addCategory = (params) => {
  return connection.queryAsync(
    `insert into category set ?`, params)
  .then(success => success)
  .catch((err) => {
    console.error(err);
    return err;
  })
};

// adds seller to database
// params in format { name: sellerName }
const addSeller = (params) => {
  return connection.queryAsync(
    `insert into seller set ?`, params)
  .then(success => success)
  .catch((err) => {
    console.error(err);
    return err;
  })
};

// adds new item to database
// params in format 
// { upc: , name: , brand: , listed_price: , item_desc: , updated_at: , category_id }
const insertItem = (params) => {
  return connection.queryAsync(
    `insert into item set ?`, params)
  .then(success => success)
  .catch((err) => {
    console.error(err);
    return err;
  })
};

// add new image to database
// params = { image_url1: , image_url2: , image_url3: , item_id: }
const insertImage = (params) => {
  return connection.queryAsync(
    `insert into image set ?`, params)
  .then(success => success)
  .catch((err) => {
    console.error(err);
    return err;
  })
};

// add item detail
// params = { item_detail_desc: , item_id: }
const insertItemDetail = (params) => {
  return connection.queryAsync(
    `insert into item_detail set ?`, params)
  .then(success => success)
  .catch((err) => {
    console.error(err);
    return err;
  })
};

// add item history
// params = { transaction_type: , transaction_time: , item_id: }
const insertItemHistory = (params) => {
  return connection.queryAsync(
    `insert into item_history set ?`, params)
  .then(success => success)
  .catch((err) => {
    console.error(err);
    return err;
  })
};

module.exports = {
  addCategory,
  addSeller,
  insertItem,
  insertImage,
  insertItemDetail,
  insertItemHistory,
  getInventory,
  insertSellerItem
};

