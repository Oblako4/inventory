const Express = require('express');
const bodyParser = require('body-parser');
const db = require('../db/index');
const g = require('../data/generator.js');
const cors = require('cors');
const moment = require('moment');
const s = require('../data/seller_item.js');

const app = Express();

app.use(bodyParser.json());
app.use(cors());

app.post('/confirmCategory', (req, res) => {
  let categories = [];
  let sendToAnalytics = { items: [] };
  return db.getCategory(req.body.items)
  .then(result => {
    categories = result.map(item => item);
    return result;
  })
  .then(result => {
    return Promise.all(result.map(item => db.getCategoryOnly(item.parent_id)))
  })
  .then(result => {
    categories.forEach((e, i) => {
      sendToAnalytics.items.push({
        id: e.item_id,
        category_id: e.category_id,
        category_name: result[i][0].name + '/' + e.name
      })
    })
    res.status(201).json(sendToAnalytics);
  })
  .catch(error => {
    console.log(error);
    res.status(400).json(error);
  })
})

app.post('/confirmQuantity', (req, res) => {
  const order_id = req.body.order_id;
  db.getQuantity(req.body.item_ids)
  .then(result => {
    let sendToOrders = { items: [] };
    result.forEach(e => {
      e.order_id = order_id;
      sendToOrders.items.push(e);
    });
    res.status(201).json(sendToOrders);
  })
  .catch(error => {
    console.log(error);
    res.status(400).json(error);
  })
})

app.get('/lowStock', (req, res) => {
  db.getLowStock()
  .then(result => {
    if (result.length !== 0) {
      let lowStock = result;
      let restockDate = g.addUpdateDate();
      lowStock.forEach(e => {
        e.quantity = g.updateQuantity();
        e.restockDate = restockDate;
        e.transactionType = 'restock';
      })
      console.log('lowStock', lowStock);
      db.updateLowStock(lowStock)
      .then(result => {
        db.updateItemsAfterRestock(lowStock)
        .then(result => {
          db.updateItemHistoryAfterRestock(lowStock)
          .then(result => {
            res.status(200).json(result);
          })
        })
      })
    }   
  })
  .catch(error => {
    console.log(error);
    res.status(400).json(error);
  })
}) 

// save new images
app.post('/image', (req, res) => {
  db.insertImage(req.body)
  .then(result => {
    res.status(201).json(result);
  })
  .catch(error => {
    console.log(error);
    res.status(400).json(error);
  })
})

// save item history
app.post('/itemHistory', (req, res) => {
  db.insertItemHistory(req.body)
  .then(result => {
    res.status(201).json(result);
  })
  .catch(error => {
    console.log(error);
    res.status(400).json(error);
  })
})

// save item detail
app.post('/itemDetail', (req, res) => {
  db.insertItemDetail(req.body)
  .then(result => {
    res.status(201).json(result);
  })
  .catch(error => {
    console.log(error);
    res.status(400).json(error);
  })
})

// let's get the whole current inventory
app.get('/currentInventory', (req, res) => {
  db.getInventory()
  .then(result => {
    res.status(200).json(result);
  })
  .catch(error => {
    console.log(error);
    res.status(400).json(error);
  })
})

// new items go through here
app.post('/inventoryUpdate', (req, res) => {
  var updateDate = moment(req.body.updated_at).format('YYYY-MM-DD HH:mm:ss');
  var brand = req.body.brand;
  var price = req.body.listed_price;
  var name = req.body.name;
  db.insertItem(req.body)
  .then(result => {
    var itemId = result.insertId;
    var images = g.addImages(itemId);
    var itemDetail = g.addDetail(itemId, brand);
    var itemHistory = g.addHistory(updateDate, itemId);
    var sellerItems = s.sellerItem(itemId, name, price);
    db.insertImage(images)
    .then(result => {
      db.insertItemDetail(itemDetail)
      .then(result => {
        db.insertItemHistory(itemHistory)
        .then(result => {
          db.insertSellerItem(sellerItems)
          .then(result => {
            res.status(201).json(result);
          })
        })
      })
    })
  })
  .catch(error => {
    console.log(error);
    res.status(400).json(error);
  })
})

// use for initial load of parent categories to database
app.post('/addCategory', (req, res) => {
  if (req.body.length > 1) {
    req.body.forEach((e, i) => {
      db.addCategory(e)
      .then(result => {
        res.status(201).json(result);
      })
      .catch(error => {
        console.log(error);
        res.status(400).json(error);
      })
    });
  } else {
    db.addCategory(req.body)
    .then(result => {
      res.status(201).json(result);
    })
    .catch(error => {
      console.log(error);
      res.status(400).json(error);
    })
  }
})

app.post('/addSeller', (req, res) => {
  if (req.body.length > 1) {
    req.body.forEach((e, i) => {
      db.addSeller(e)
      .then(result => {
        res.status(201).json(result);
      })
      .catch(error => {
        console.log(error);
        res.status(400).json(error);
      })
    });
  } else {
    db.addSeller(req.body)
    .then(result => {
      res.status(201).json(result);
    })
    .catch(error => {
      console.log(error);
      res.status(400).json(error);
    })
  }
})

app.listen(process.env.PORT || 3000, () => {
  console.log('Listening on Port 3000!');
});


