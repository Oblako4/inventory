const axios = require('axios');

// generate mock API call to /getQuantity from orders service
// current shape from orders {order_id: 12341234, item_ids: [123456789012, 123456789011]}

const generateOrder = () => {
  return {
    order_id: Math.floor(Math.random() * 1000),
    item_ids: [Math.floor(Math.random() * 1000), Math.floor(Math.random() * 500)]
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
// confirmQuantity(order1);
// confirmQuantity({'728'});