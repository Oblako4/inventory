const axios = require('axios');
const g = require('./generator.js');

// sample set
var items = [
    {
        "id": 1,
        "brand": "Generic Chair"
    },
    {
        "id": 2,
        "brand": "Fantastic Cheese"
    },
    {
        "id": 3,
        "brand": "Incredible Keyboard"
    },
    {
        "id": 4,
        "brand": "Handcrafted Shoes"
    },
    {
        "id": 5,
        "brand": "Unbranded Mouse"
    },
    {
        "id": 6,
        "brand": "Generic Shoes"
    },
    {
        "id": 7,
        "brand": "Unbranded Bike"
    },
    {
        "id": 8,
        "brand": "Awesome Shirt"
    },
    {
        "id": 9,
        "brand": "Sleek Chips"
    },
    {
        "id": 10,
        "brand": "Ergonomic Shirt"
    },
    {
        "id": 11,
        "brand": "Handmade Salad"
    },
    {
        "id": 12,
        "brand": "Tasty Hat"
    },
    {
        "id": 13,
        "brand": "Refined Table"
    },
    {
        "id": 14,
        "brand": "Unbranded Chicken"
    },
    {
        "id": 15,
        "brand": "Small Computer"
    },
    {
        "id": 16,
        "brand": "Sleek Pants"
    },
    {
        "id": 17,
        "brand": "Intelligent Computer"
    },
    {
        "id": 18,
        "brand": "Handmade Tuna"
    },
    {
        "id": 19,
        "brand": "Intelligent Fish"
    },
    {
        "id": 20,
        "brand": "Practical Ball"
    },
    {
        "id": 21,
        "brand": "Unbranded Soap"
    },
    {
        "id": 22,
        "brand": "Licensed Pizza"
    },
    {
        "id": 23,
        "brand": "Refined Chicken"
    }
];

var itemDetail = [];

for (var i = 0; i < items.length; i++) {
    itemDetail.push({
        item_detail_desc: g.addDetail(items[i].brand),
        item_id: items[i].id
    })
}

var sendDetails = () => {
  for (var j = 0; j < items.length; j++) {
      axios.post('http://localhost:3000/itemDetail', itemDetail[j])
      .then(response => {
        console.log('success');
      })
      .catch(error => {
        console.log(error);
      });
  }
}
// console.log(itemDetail);
// sendDetails();

module.exports = {
    items
}