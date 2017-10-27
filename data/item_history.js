const axios = require('axios');
const moment = require('moment');

// sample set
var currentInv = [
    {
        "id": 1,
        "brand": "Generic Chair",
        "updated_at": "2017-09-01T11:54:46.000Z"
    },
    {
        "id": 2,
        "brand": "Fantastic Cheese",
        "updated_at": "2017-08-09T00:01:32.000Z"
    },
    {
        "id": 3,
        "brand": "Incredible Keyboard",
        "updated_at": "2017-09-07T04:02:08.000Z"
    },
    {
        "id": 4,
        "brand": "Handcrafted Shoes",
        "updated_at": "2017-08-08T21:51:49.000Z"
    },
    {
        "id": 5,
        "brand": "Unbranded Mouse",
        "updated_at": "2017-10-24T09:48:24.000Z"
    },
    {
        "id": 6,
        "brand": "Generic Shoes",
        "updated_at": "2017-10-05T17:43:51.000Z"
    },
    {
        "id": 7,
        "brand": "Unbranded Bike",
        "updated_at": "2017-08-03T22:53:44.000Z"
    },
    {
        "id": 8,
        "brand": "Awesome Shirt",
        "updated_at": "2017-08-17T16:19:05.000Z"
    },
    {
        "id": 9,
        "brand": "Sleek Chips",
        "updated_at": "2017-07-25T08:57:56.000Z"
    },
    {
        "id": 10,
        "brand": "Ergonomic Shirt",
        "updated_at": "2017-10-20T15:43:02.000Z"
    },
    {
        "id": 11,
        "brand": "Handmade Salad",
        "updated_at": "2017-08-21T19:51:49.000Z"
    },
    {
        "id": 12,
        "brand": "Tasty Hat",
        "updated_at": "2017-09-29T20:15:48.000Z"
    },
    {
        "id": 13,
        "brand": "Refined Table",
        "updated_at": "2017-10-16T00:00:27.000Z"
    },
    {
        "id": 14,
        "brand": "Unbranded Chicken",
        "updated_at": "2017-08-07T04:31:41.000Z"
    },
    {
        "id": 15,
        "brand": "Small Computer",
        "updated_at": "2017-08-19T05:24:05.000Z"
    },
    {
        "id": 16,
        "brand": "Sleek Pants",
        "updated_at": "2017-08-01T07:43:21.000Z"
    },
    {
        "id": 17,
        "brand": "Intelligent Computer",
        "updated_at": "2017-10-18T08:34:03.000Z"
    },
    {
        "id": 18,
        "brand": "Handmade Tuna",
        "updated_at": "2017-08-02T01:56:00.000Z"
    },
    {
        "id": 19,
        "brand": "Intelligent Fish",
        "updated_at": "2017-09-22T15:21:28.000Z"
    },
    {
        "id": 20,
        "brand": "Practical Ball",
        "updated_at": "2017-10-20T12:09:59.000Z"
    },
    {
        "id": 21,
        "brand": "Unbranded Soap",
        "updated_at": "2017-09-26T07:23:39.000Z"
    },
    {
        "id": 22,
        "brand": "Licensed Pizza",
        "updated_at": "2017-09-18T11:10:37.000Z"
    },
    {
        "id": 23,
        "brand": "Refined Chicken",
        "updated_at": "2017-07-31T20:57:55.000Z"
    }
];

var itemHistory = [];

for (var i = 0; i < currentInv.length; i++) {
    itemHistory.push({
        transaction_type: 'new item',
        transaction_time: moment(currentInv[i].updated_at).format('YYYY-MM-DD HH:mm:ss'),
        item_id: currentInv[i].id
    })
}

var sendHistory = () => {
  for (var j = 0; j < itemHistory.length; j++) {
      axios.post('http://localhost:3000/itemHistory', itemHistory[j])
      .then(response => {
        console.log('success');
      })
      .catch(error => {
        console.log(error);
      });
  }
}

// sendHistory();

module.exports = {
    itemHistory
}

