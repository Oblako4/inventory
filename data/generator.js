const db = require('../db/index');
const _ = require('lodash');
const faker = require('faker');
const c = require('./categories.js');
const s = require('./sellerInfo.js');
const moment = require('moment');

// add sub-categories to database

var inventoryChange = () => {
  // create a an object to be sent to client
  var c_id = addCategoryId();
  var inventoryBlob = { item: {
      id: 1,
      upc: genUPC(),
      categoryId: c_id,
      category_name: addCategoryName(c_id),
      description: addDescription(),
      updated_at: addUpdateDate(),
      transaction_type: addTransactionType()
    },
    images: addImages(),
    sellers: addSellers()
  };
  return inventoryBlob;
};

var genUPC = () => {
  var upc = '';
  var alphabet = "abcdefghijklmnopqrstuvwxyz";
  for (var i = 0; i < 10; i++) {
    if (i === 0) {
      upc += alphabet[Math.floor(Math.random() * alphabet.length)].toUpperCase();
    }
    if (i > 0 && i <= 2) {
      upc += Math.floor(Math.random() * 10);
    }
    if (i > 2 && i <= 5) {
      upc += alphabet[Math.floor(Math.random() * alphabet.length)].toUpperCase();
    }
    if (i > 5 && i <= 7) {
      upc += Math.floor(Math.random() * 10);
    }
    if (i === 8) {
      upc += alphabet[Math.floor(Math.random() * alphabet.length)].toUpperCase();
    }
    if (i === 9) {
      upc += Math.floor(Math.random() * 10);
    }
  }
  return upc;
}

var addCategoryId = () => {
  // gives us a random subcategory
  return Math.floor(Math.random() * (105 - 36) + 36);
};

var addCategoryName = (categoryId) => {
  var categoryName = '', parentId;
  parentId = c.subcategories[categoryId - 36][2];
  categoryName += c.categoriesParent[parentId][1];
  categoryName += '/' + c.subcategories[categoryId - 36][1];
  return categoryName;
};

var addDescription = () => {
  return faker.commerce.productAdjective() + ' ' + faker.commerce.product();
};

var addDetail = (id, desc) => {
  var basicDescription = addDescription();
  return {
    item_detail_desc: desc + ' ' + basicDescription,
    item_id: id
  }
};

var addHistory = (updateDate, itemId) => {
  return {
    transaction_type: addTransactionType(),
    transaction_time: updateDate,
    item_id: itemId
  }
}

var addUpdateDate = () => {
  return moment(faker.date.between('2017-07-25', '2017-10-25')).format('YYYY-MM-DD HH:mm:ss');
};

// const transactionTypes = ['new item', 'purchase', 'restock'];
const transactionTypes = ['new item']; // add purchase and restock later
var addTransactionType = () => {
  return transactionTypes[Math.floor(Math.random() * transactionTypes.length)]
};

var addImages = (id) => {
  return { image_url1: faker.image.image(), 
    image_url2: faker.image.image(),
    image_url3: faker.image.image(),
    item_id: id };
};

var addSellers = () => {
  var sellerCount = Math.floor(Math.random() * 5);
  var sellerList = [];
  for (var j = 0; j < sellerCount; j++) {
    var randomIndex = Math.floor(Math.random() * s.sellers.length);
    var obj = {
      id: s.sellers[randomIndex][0],
      name: s.sellers[randomIndex][1],
      quantity: Math.floor(Math.random() * ((10 - 1) + 1))
    };
    sellerList.push(obj);
  }
  return sellerList;
};

var updateQuantity = () => {
  var updatedQuantity = Math.floor(Math.random() * ((10 - 1) + 1));
  return updatedQuantity > 0 ? updatedQuantity : 1;
}

module.exports = {
  inventoryChange,
  genUPC,
  addCategoryId,
  addCategoryName,
  addDescription,
  addUpdateDate,
  addTransactionType,
  addImages,
  addSellers,
  addDetail, 
  addHistory,
  updateQuantity
}














