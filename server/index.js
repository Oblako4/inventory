const Express = require('express');
const bodyParser = require('body-parser');
const db = require('../db/index');
const g = require('../data/generator.js');
const cors = require('cors');
const moment = require('moment');
const s = require('../data/seller_item.js');
const axios = require('axios');

const AWS = require('aws-sdk');
const Consumer = require('sqs-consumer');
const ordersQuantityCheckQueue = require('../messagebus/config.js').ordersQuantityCheck;
const ordersQuantityUpdateQueue = require('../messagebus/config.js').ordersQuantityUpdate;
const analyticsOutboxQueue = require('../messagebus/config.js').analyticsOutbox;
const analyticsInboxQueue = require('../messagebus/config.js').analyticsInbox;
const inventoryOutboxQueue = require('../messagebus/config.js').inventoryOutbox;
const userActivityInboxQueue = require('../messagebus/config.js').userActivityInbox;

AWS.config.loadFromPath('./messagebus/config.json');
const sqsSendInventoryOutbox = new AWS.SQS({apiVersion: '2012-11-05'});

// AWS.config.loadFromPath('./messagebus/analytics/config.json');
const sqsSendAnalytics = new AWS.SQS({apiVersion: '2012-11-05'});

// AWS.config.loadFromPath('./messagebus/orders/config.json');
const sqsSendQuantityOrders = new AWS.SQS({apiVersion: '2012-11-05'});

const sqsUpdateQuantityUsers = new AWS.SQS({apiVersion: '2012-11-05'});

const app = Express();

app.use(bodyParser.json());
app.use(cors());

const sqsConsumerUpdateQuantity = Consumer.create({
  queueUrl: ordersQuantityUpdateQueue,
  handleMessage: (message, done) => {
    let messageU = JSON.parse(message.Body);
    console.log('a confirmed order', messageU);
    let order = messageU.items;
    let orderDate = g.addUpdateDate();
    let sendToUserActivity = [];
    order.forEach(e => {
      e.transactionType = 'purchase',
      e.purchaseDate = orderDate
    })
    return Promise.all(order.map(item => {
      return db.updateQuantity(item)
    }))
    .then(result => {
      return Promise.all(order.map(item => {
        return db.getQuantity(item);
      }))
    })
    .then(result => {
      result.forEach(e => {
        sendToUserActivity.push(e[0]);
      })
      let toUserActivity = {
        MessageBody: JSON.stringify(sendToUserActivity),
        QueueUrl: userActivityInboxQueue
      }
      console.log('to user activity', sendToUserActivity);
      return sqsUpdateQuantityUsers.sendMessage(toUserActivity).promise()
    })
    .then(data => {
      console.log("Success", data.MessageId);
      done()
    })
    .catch(err => console.log(err));
  },
  sqs: sqsUpdateQuantityUsers
});

sqsConsumerUpdateQuantity.on('error', err => {
  console.log(err.message);
});

sqsConsumerUpdateQuantity.start();

const sqsConsumerAnalytics = Consumer.create({
  queueUrl: analyticsOutboxQueue,
  handleMessage: (message, done) => {
    let messageA = JSON.parse(message.Body);
    // console.log('a new message', messageA);
    let categories = [];
    let sendToAnalytics = { items: [],
      order_id: messageA.order_id };
    return db.getCategory(messageA.items)
    .then(result => {
      categories = result.map(item => item);
      return result;
    })
    .then(result => {
      return Promise.all(result.map(item => {
        return db.getCategoryOnly(item.parent_id);
      }))
    })
    .then(result => {
      categories.forEach((e, i) => {
        sendToAnalytics.items.push({
          id: e.item_id,
          category_id: e.category_id,
          category_name: result[i][0].name + '/' + e.name
        })
      })
      let toAnalytics = {
        MessageBody: JSON.stringify(sendToAnalytics),
        QueueUrl: analyticsInboxQueue
      }
      return sqsSendAnalytics.sendMessage(toAnalytics).promise()
    })
    .then(data => {
      console.log("Success", data.MessageId);
      done()
    })
    .catch(err => console.log(err));
  },
  sqs: sqsSendAnalytics
});

sqsConsumerAnalytics.on('error', err => {
  console.log(err.message);
});

sqsConsumerAnalytics.start();

const sqsConsumerQuantityOrders = Consumer.create({
  queueUrl: ordersQuantityCheckQueue,
  handleMessage: async (message, done) => {
    const messageQ = JSON.parse(message.Body);
    const order_id = messageQ.order_id;
    let sendToOrders = [];
    await Promise.all(messageQ.items.map(item => {
      return db.getQuantity(item);
    }))
    .then(result => {
      result.forEach(e => {
        if (e.length !== 0) {
          e[0].order_id = order_id;
          sendToOrders.push(e[0]);
        } else {
          e = {};
          e.quantity = 0;
          e.order_id = order_id;
          sendToOrders.push(e);
        }
      })
      console.log('send to orders', sendToOrders);
      let toOrdersQuantity = {
        MessageBody: JSON.stringify(sendToOrders),
        QueueUrl: inventoryOutboxQueue
      }
      return sqsSendQuantityOrders.sendMessage(toOrdersQuantity).promise()
    })
    .then(data => {
      console.log("Success", data.MessageId);
      done()
    })
    .catch(err => console.log(err));
  },
  sqs: sqsSendQuantityOrders
});

sqsConsumerQuantityOrders.on('error', err => {
  console.log(err.message);
});

sqsConsumerQuantityOrders.start();

app.post('/order', (req, res) => {
  let order = req.body.items;
  let orderDate = g.addUpdateDate();
  let sendToUserActivity = [];
  order.forEach(e => {
    e.transactionType = 'purchase',
    e.purchaseDate = orderDate
  })
  console.log('this is order', order);
  return Promise.all(order.map(item => db.updateQuantity(item)))
  .then(result => {
    return Promise.all(order.map(item => {
      return db.getQuantity(item);
    }))
  })
  .then(result => {
     result.forEach(e => {
      sendToUserActivity.push(e[0]);
    })
    return sendToUserActivity;
  })
  .then(result => {
    res.status(201).json(result);
  })
  .catch(error => {
    console.log(error);
    res.status(400).json(error);
  })
})

app.post('/confirmCategory', (req, res) => {
  let categories = [];
  let sendToAnalytics = { items: [],
    order_id: req.body.order_id };
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
    // console.log('a new message', messageQO);
  const order_id = req.body.order_id;
  let sendToOrders = [];
  return Promise.all(req.body.items.map(item => {
    return db.getQuantity(item);
  }))
  .then(result => {
    result.forEach(e => {
      e[0].order_id = order_id;
    })
    result.forEach(e => {
      sendToOrders.push(e[0]);
    })
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
      console.log('after restocking', lowStock);
      return db.restock(lowStock);
    } else {
      return 'Sufficient quantities';
    } 
  })
  .then(result => {
    res.status(200).json(result);
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
  let newItem = req.body;
  db.newInventoryItem(req.body)
  .then(result => {
    console.log('this is item id', result); // this is item id
    newItem.item.sellers.forEach(e => {
      e.item_id = result;
    });
    newItem.item.id = result;
    console.log('This goes to UA', newItem);
    return newItem;
  })
  .then(result => {
    res.status(201).json(result);
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
    })
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


