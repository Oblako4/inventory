const mysql = require('mysql');
const createConnection = require('mysql-promise-extension').createConnection;
const Promise = require('bluebird');

var inventoryUpdate = createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'inventory'
});

// inventoryUpdate.connect();
const connection = Promise.promisifyAll(inventoryUpdate);

// update quantity information based on order
// item [ { } ]
const updateQuantity = (async (item) => {
  const order = item;
  try {
    await connection.beginTransactionP()
    const queryUpdateSellerItem = await connection.queryP({
      sql: 'update seller_item set quantity = quantity - ? where seller_item.item_id = ? and seller_item.seller_id = ?',
      values: [order.quantity, order.item_id, order.seller_id]
    })
    const queryUpdateItem = await connection.queryP({
      sql: `update item set updated_at = ?`,
      values: [order.purchaseDate]
    })
    const queryInsertItemHistory = await connection.queryP({
      sql: `insert into item_history set transaction_type = ?, transaction_time = ?, item_id = ?`,
      values: [order.transactionType, order.purchaseDate, order.item_id]
    })
    await connection.commitTransactionP()
    return queryInsertItemHistory.affectedRows
  }
  catch(err) {
    await connection.rollbackP()
  }
  finally {
    await connection.endP()
  }
  return 0
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
const getQuantity = itemIds => {
  return connection.queryAsync(`
    select item.id, seller_item.seller_id, seller_item.wholesale_price, seller_item.quantity from item \
    left join seller_item on item.id = seller_item.item_id where item.id IN (?)`, [itemIds])
  .then(success => success)
  .catch(err => {
    console.error(err);
    return err;
  })
}

// get sold out items
const getLowStock = () => {
  return connection.queryAsync(
    `select * from seller_item where quantity = 0 order by item_id limit 100`)
  .then(success => success) 
  .catch(err => {
    console.error(err);
    return err;
  })
}

// update item after restock
const updateItemsAfterRestock = (params) => {
  return Promise.all(params.map(param => 
    connection.queryAsync(`update item set updated_at = ? where id = ?`, [param.restockDate, param.item_id])
  ))
  .then(success => success)
  .catch(err => {
    console.error(err);
    return err;
  })
}

// update item history after restock
const updateItemHistoryAfterRestock = (params) => {
  return Promise.all(params.map(param => 
    connection.queryAsync(`insert into item_history set transaction_type = ?, \
      transaction_time = ?, item_id = ?`, [param.transactionType, param.restockDate, param.item_id])
  ))
  .then(success => success)
  .catch(err => {
    console.error(err);
    return err;
  })
}

// update quantity of low stock items
const updateLowStock = (params) => {
  return Promise.all(params.map(param => 
    connection.queryAsync(
      `update seller_item set quantity = ? where seller_id = ? and item_id = ?`, [param.quantity, param.seller_id, param.item_id])
  ))
  .then(success => success)
  .catch(err => {
    console.error(err);
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
  updateItemsAfterRestock, 
  updateItemHistoryAfterRestock,
  updateLowStock,
  getQuantity,
  getCategory,
  getCategoryOnly,
  updateQuantity
};

