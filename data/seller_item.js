const i = require('./item.js');
const s = require('./sellerInfo.js');
const faker = require('faker');

// fields required 
// id (seller_item_id), item_name, wholesale_price, quantity, seller_id (fk), item_id (fk)
// id, item_name, wholesale_price, quantity, seller_id, item_id

const wholesalePrice = (price) => {
  var sansMarkUp = [0.3, 0.4, 0.5, 0.6];
  var randomIndex = Math.floor(Math.random() * sansMarkUp.length);
  return Math.round(price * sansMarkUp[randomIndex]);
}

const quantityAvailable = () => {
  return Math.floor(Math.random() * 10);
}

var sellerItem = (id, name, price) => {
  var sellerCount = Math.floor(Math.random() * 5);
  var sellerList = [];
  for (var j = 0; j < sellerCount; j++) {
    var randomIndex = Math.floor(Math.random() * s.sellers.length);
    var obj = {
      item_name: name,
      wholesale_price: wholesalePrice(price),
      quantity: Math.floor(Math.random() * ((10 - 1) + 1)),
      seller_id: s.sellers[randomIndex][0],
      item_id: id
    };
    sellerList.push(obj);
  }
  return sellerList;
};

module.exports = {
  sellerItem
}



