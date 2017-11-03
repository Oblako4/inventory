const axios = require('axios');

// generate mock API call to /confirmQuantity from orders service
// current shape from orders {order_id: 12341234, items: [123456789012, 123456789011]}

const generateOrder = () => {
  return {
    items: [ {
      item_id: 640,
      seller_id: 45,
      quantity: 1
    },
    {
      item_id: 641,
      seller_id: 79,
      quantity: 1
    } ]
  }
}

const confirmQuantity = order => {
  axios.post('http://localhost:3000/confirmQuantity', order)
  .then(response => {
    console.log('success');
  })
  .catch(error => {
    console.log(error);
  });
};

const order1 = { order_id: 6, item_ids: [ 728, 315 ] };
// test:
// confirmQuantity(order1);

// generate mock API call to /confirmQuantity from analytics service
// current shape from analytics { items: [12345, 23456, 34567] }

let itemId = () => (Math.floor(Math.random() * 500));
const listOfItemIds = () => {
  return {
    items: [itemId(), itemId(), itemId()]
  }
}
const list1 = { items: [ 326, 14, 30 ] };

const confirmCategory = itemIds => {
  axios.post('http://localhost:3000/confirmCategory', itemIds)
  .then(response => {
    console.log('success');
  })
  .catch(error => {
    console.log(error);
  });
}
// test:
// confirmQuantity(list1);

// generate mock API call to /order from orders service
console.log(generateOrder());
const order2 = { items: 
   [ { item_id: 640, seller_id: 45, quantity: 1 },
     { item_id: 641, seller_id: 79, quantity: 1 } ] };

const sendOrder = order => {
  axios.post('http://localhost:3000/order', order)
  .then(response => {
    console.log('success');
  })
  .catch(error => {
    console.log(error);
  });
}

// sendOrder(order2);














