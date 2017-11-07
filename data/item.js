const faker = require('faker');
const g = require('./generator.js');
const s = require('./sellerInfo.js');
const si = require('./seller_item.js');
const c = require('./categories.js');
const axios = require('axios');
const moment = require('moment');
const cron = require('node-cron');
// id, upc, name, listed_price, brand, item_desc, updated_at, seller_id (fk),
// image_id (fk), category_id (fk), item_detail_id (fk)

var item = () => {
  const c_id =  g.addCategoryId();
  let c_name, p_id, p_name, product_name = faker.commerce.productName(), price = faker.finance.amount(2, 100, 2);
  let p_brand = faker.commerce.productAdjective() + ' ' + faker.commerce.product();
  for (let i = 0; i < c.subcategories.length; i++) {
    if (c.subcategories[i].id === c_id) {
      c_name = c.subcategories[i].name;
      p_id = c.subcategories[i].parent_id;
    }
  } 
  for (let j = 0; j < c.categoriesParent.length; j++) {
    if (c.categoriesParent[j].id === p_id) {
      p_name = c.categoriesParent[j].name;
    }
  }
  return {
    item: {
      upc: g.genUPC(),
      category_id: c_id,
      category_name: p_name + '/' + c_name,
      description: g.addDescription(),
      itemDetail: g.addDetail(p_brand),
      name: product_name,
      brand: p_brand,
      listed_price: price,
      updated_at: moment(g.addUpdateDate()).format("YYYY-MM-DD HH:mm:ss"),
      transaction_type: 'new item',
      images: [ faker.image.image(), faker.image.image(), faker.image.image() ],
      sellers: si.sellerItem(product_name, price)
    }
  }
}

var sendNewInventory = () => {
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
  for (var i = 0; i < 10; i++) {
    sendNewInventory();
  }
};

let task = cron.schedule('0-55 * * * * *', function(){
  console.log('running a task every second');
  newItems();
});
task.start();
task.stop();

// newItems();
// console.log(item());
// sendNewInventory();

// console.log(faker.finance.amount(2, 100, 2));

module.exports = {
  item,
  sendNewInventory
}






