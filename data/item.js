const faker = require('faker');
const g = require('./generator.js');
const s = require('./sellerInfo.js');
const axios = require('axios');
// id, upc, name, listed_price, brand, item_desc, updated_at, seller_id (fk),
// image_id (fk), category_id (fk), item_detail_id (fk)

var item = () => {
  return {
    upc: g.genUPC(),
    name: faker.commerce.productName(),
    brand: faker.commerce.productAdjective() + ' ' + faker.commerce.product(),
    listed_price: faker.commerce.price(),
    item_desc: g.addDescription(),
    updated_at: g.addUpdateDate(),
    category_id: g.addCategoryId()
  }
}

var sendNewInventory = (data) => {
  var nextItem = item();
  axios.post('http://localhost:3000/inventoryUpdate', nextItem)
  .then(response => {
    console.log('success');
  })
  .catch(error => {
    console.log(error);
  });
};

var newItems = () => {
  for (var i = 0; i < 1000; i++) {
    sendNewInventory();
  }
};
// sendNewInventory();
// newItems();

module.exports = {
  item,
  sendNewInventory
}