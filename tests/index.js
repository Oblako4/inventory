const mysql = require('mysql');
const createConnection = require('mysql-promise-extension').createConnection;
const Promise = require('bluebird');
const g = require('../data/generator.js');
const s = require('../data/seller_item.js');
const moment = require('moment');

const inventoryUpdate = createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'inventory'
});

// inventoryUpdate.connect();
const connection = Promise.promisifyAll(inventoryUpdate);

// update inventory with new item
const newInventoryItem = item => {
  const newItem = item.item;
  let itemId = 0;
  return connection.queryAsync('START TRANSACTION')
  .then(() => {
    return connection.queryAsync(`insert into item set ?`, { upc: newItem.upc, 
      name: newItem.name, 
      brand: newItem.brand, 
      listed_price: newItem.listed_price, 
      item_desc: newItem.description, 
      updated_at: newItem.updated_at, 
      category_id: newItem.category_id } )
  })
  .then(result => {
    itemId = result.insertId;
    newItem.sellers.forEach(e => e.item_id = itemId);
    return Promise.all(newItem.sellers.map(sellerItem => {
      return connection.queryAsync(`insert into seller_item set ?`, sellerItem)
    }))
  }) 
  .then(result => {
    return connection.queryAsync(`insert into image set image_url1 = ?, image_url2 = ?, image_url3 = ?, item_id = ?`,
      [newItem.images[0], newItem.images[1], newItem.images[2], itemId])
  })
  .then(result => {
    return connection.queryAsync(`insert into item_detail set item_detail_desc = ?, item_id = ?`,
      [newItem.itemDetail, itemId])
  })
  .then(result => {
    return connection.queryAsync(`insert into item_history set transaction_type = ?, transaction_time = ?, item_id = ?`,
      [newItem.transaction_type, newItem.updated_at, itemId])
  })
  .then(() => {
    return connection.queryAsync('COMMIT');
  })
  .then(() => {
    return itemId;
  })
  .catch(err => {
    console.log(error);
    return err;
  })
}

// update quantity information based on order
// item [ { } ]
const updateQuantity = (item => {
  const order = item;
  return connection.queryAsync('START TRANSACTION')
  .then(() => {
    return connection.queryAsync(`update seller_item set quantity = quantity - ? where seller_item.item_id = ? and seller_item.seller_id = ?`,
      [order.quantity, order.item_id, order.seller_id])
  })
  .then(() => {
    return connection.queryAsync(`update item set updated_at = ?`, [order.purchaseDate])
  })
  .then(() => {
    return connection.queryAsync(`insert into item_history set transaction_type = ?, transaction_time = ?, item_id = ?`,
      [order.transactionType, order.purchaseDate, order.item_id])
  })
  .then(() => {
    return connection.queryAsync('COMMIT');
  })
  .catch(err => {
    console.log(error);
    return err;
  })  
})

// get category information for items
const getCategory = itemIds => {
  return connection.queryAsync(`select item.id as item_id, category.id as category_id, category.name, category.parent_id from item \
    left join category on item.category_id = category.id where item.id IN (?)`, [itemIds]) 
  .then(success => success) 
  .catch(err => {
    console.error(err);
    return err;
  })
}

const getCategoryOnly = categoryId => {
  return connection.queryAsync(`select name from category where id = ?`, categoryId)
  .then(success => success)
  .catch(err => {
    console.log(error);
    return err;
  })
}

// get seller, wholesale_price, and quantity per item id
const getQuantity = item => {
  return connection.queryAsync(`
    select item.id, seller_item.seller_id, seller_item.wholesale_price, seller_item.quantity from item \
    left join seller_item on item.id = seller_item.item_id where item.id =? and seller_id = ?`, [item.item_id, item.seller_id])
  .then(success => success)
  .catch(err => {
    console.error(err);
    return err;
  })
}

// get sold out items
const getLowStock = () => {
  return connection.queryAsync(
    `select * from seller_item where quantity = 0 order by item_id limit 50`)
  .then(success => success) 
  .catch(err => {
    console.error(err);
    return err;
  })
}

const restock = restockItems => {
  return connection.queryAsync('START TRANSACTION')
  .then(() => {
    return Promise.all(restockItems.map(item => 
      connection.queryAsync(`update item set updated_at = ? where id = ?`, [item.restockDate, item.item_id])
    ))
  })
  .then(() => {
    return Promise.all(restockItems.map(item => 
      connection.queryAsync(`insert into item_history set transaction_type = ?, \
      transaction_time = ?, item_id = ?`, [item.transactionType, item.restockDate, item.item_id])
    ))
  })
  .then(() => {
    return Promise.all(restockItems.map(item => 
      connection.queryAsync(
      `update seller_item set quantity = ? where seller_id = ? and item_id = ?`, [item.quantity, item.seller_id, item.item_id])
    ))
  })
  .then(() => {
    return connection.queryAsync('COMMIT');
  })
  .catch(err => {
    console.log(error);
    return err;
  })  
}

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
  insertSellerItem, 
  getLowStock,
  restock,
  getQuantity,
  getCategory,
  getCategoryOnly,
  updateQuantity,
  newInventoryItem
};

