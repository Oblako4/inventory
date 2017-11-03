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

const sellerItem = (name, price) => {
  let sellerCount = Math.floor(Math.random() * 5) > 0 ? Math.floor(Math.random() * 5) : 1;
  let sellerList = [];
  for (let j = 0; j < sellerCount; j++) {
    let randomIndex = Math.floor(Math.random() * (s.sellers.length - 1)) > 0 ? Math.floor(Math.random() * (s.sellers.length - 1)) : 1;
    let obj = {
      item_name: name,
      wholesale_price: wholesalePrice(price),
      quantity: Math.floor(Math.random() * ((10 - 1) + 1)),
      seller_id: s.sellers[randomIndex].id,
      item_id: ''
    };
    sellerList.push(obj);
  }
  return sellerList.length > 0 ? sellerList : [ { item_name: name, wholesale_price: wholesalePrice(price), quantity: 1, seller_id: 1, item_id: '' } ];
};

// console.log(sellerItem(2, 'cool', 10)); 

module.exports = {
  sellerItem
}




