const Express = require('express');
const bodyParser = require('body-parser');
const db = require('../db/index');
const g = require('../data/generator.js');
const cors = require('cors');
const moment = require('moment');
const s = require('../data/seller_item.js');
const axios = require('axios');
const Promise = require('bluebird');

//===========Redis===============
const RedisServer = require('redis-server');
const redis = require('redis');
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);
 
const server = new RedisServer(6379);
const client = redis.createClient();
//===============================

const AWS = require('aws-sdk');
const Consumer = require('sqs-consumer');
const ordersQuantityCheckQueue = require('../messagebus/config.js').ordersQuantityCheck;
const ordersQuantityUpdateQueue = require('../messagebus/config.js').ordersQuantityUpdate;
const analyticsOutboxQueue = require('../messagebus/config.js').analyticsOutbox;
const analyticsInboxQueue = require('../messagebus/config.js').analyticsInbox;
const inventoryOutboxQueue = require('../messagebus/config.js').inventoryOutbox;
const userActivityInboxQueue = require('../messagebus/config.js').userActivityInbox;

AWS.config.loadFromPath('./messagebus/config.json');
AWS.config.setPromisesDependency(require('bluebird'));
const sqsSendInventoryOutbox = new AWS.SQS({apiVersion: '2012-11-05'});
const sqsSendAnalytics = new AWS.SQS({apiVersion: '2012-11-05'});
const sqsSendQuantityOrders = new AWS.SQS({apiVersion: '2012-11-05'});
const sqsUpdateQuantityUsers = new AWS.SQS({apiVersion: '2012-11-05'});

const app = Express();

app.use(bodyParser.json());
app.use(cors());

// address messsage from Orders service (quantity update)
const paramsQuantityUpdate = {
  QueueUrl: ordersQuantityUpdateQueue
};

let pollQuantityUpdateQueue = () => {
  sqsUpdateQuantityUsers.receiveMessage(paramsQuantityUpdate).promise()
  .then(data => {
    if (data.Messages) {
      handleQuantityUpdateMessages(data.Messages[0].Body, data.Messages[0].ReceiptHandle);
    }
  })
  .catch(error => console.error(error));
};

setInterval(pollQuantityUpdateQueue, 50);

let handleQuantityUpdateMessages = (message, ReceiptHandle) => {
  let messageU = JSON.parse(message);
  // console.log('a confirmed order', messageU);
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
    sqsUpdateQuantityUsers.deleteMessage({QueueUrl: ordersQuantityUpdateQueue, ReceiptHandle: ReceiptHandle}).promise();
    sqsUpdateQuantityUsers.sendMessage(toUserActivity).promise()
  })
  .catch(err => console.log(err));
};

// address messsage from Analytics service
const paramsAnalytics = {
  QueueUrl: analyticsOutboxQueue
}

let pollAnalyticsQueue = () => {
  sqsSendAnalytics.receiveMessage(paramsAnalytics).promise()
  .then(data => {
    if (data.Messages) {
      handleAnalyticsMessages(data.Messages[0].Body, data.Messages[0].ReceiptHandle);
    }
  })
  .catch(error => console.error(error));
};

// poll Analytics outbox queue every 50 ms
setInterval(pollAnalyticsQueue, 50);

let handleAnalyticsMessages = (message, ReceiptHandle) => {
  let messageA = JSON.parse(message);
  let toAnalytics = {
    MessageBody: '',
    QueueUrl: analyticsInboxQueue
  };
  let categoriesNotFound = [];
  let sendToAnalytics = { items: [],
      order_id: messageA.order_id };
  return Promise.all(messageA.items.map((e, i) => {
    return client.getAsync(e);
  }))
  .then(result => {
    result.forEach((e, i) => {
      if(e !== null) {
        sendToAnalytics.items.push({
          id: messageA.items[i],
          category_id: e.split('|')[0],
          category_name: e.split('|')[1]
        })
      } else {
        categoriesNotFound.push(messageA.items[i]);
      }
    })
    return categoriesNotFound;
  })
  .then(() => {
    if (categoriesNotFound.length !== 0) {
      return db.getCategory(categoriesNotFound);
    }
  })
  .then(result => {
    if(result !== undefined) {
      result.forEach((e, i) => {
        sendToAnalytics.items.push({
          id: e.item_id,
          category_id: e.category_id,
          category_name: e.name
        })
        let itemId = e.item_id;
        let category = result[i].category_id + '|' + result[i].name;
        client.setAsync(itemId, category);
      })
    }
  })
  .then(() => {
    toAnalytics.MessageBody = JSON.stringify(sendToAnalytics);
    sqsSendAnalytics.deleteMessage({QueueUrl: analyticsOutboxQueue, ReceiptHandle: ReceiptHandle}).promise();
    console.log('to analytics ', sendToAnalytics);
    sqsSendAnalytics.sendMessage(toAnalytics).promise()
  })
  .catch(err => console.log(err));
}

// address messsage from Orders service (quantity check)
const paramsQuantityCheck = {
  QueueUrl: ordersQuantityCheckQueue
}

let pollQuantityCheckQueue = () => {
  sqsSendQuantityOrders.receiveMessage(paramsQuantityCheck).promise()
  .then(data => {
    if (data.Messages) {
      handleQuantityCheckMessages(data.Messages[0].Body, data.Messages[0].ReceiptHandle);
    }
  })
  .catch(error => console.error(error));
};

// poll Quantity Check queue every 50 ms
setInterval(pollQuantityCheckQueue, 50);

let handleQuantityCheckMessages = (message, ReceiptHandle) => {
  const messageQ = JSON.parse(message);
  console.log(messageQ);
  const order_id = messageQ.order_id;
  let sendToOrders = [];
  return Promise.all(messageQ.items.map(item => {
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
    sqsSendAnalytics.deleteMessage({QueueUrl: ordersQuantityCheckQueue, ReceiptHandle: ReceiptHandle}).promise();
    sqsSendQuantityOrders.sendMessage(toOrdersQuantity).promise()
  })
  .catch(err => console.log(err));
};

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
  let categoriesNotFound = [];
  let sendToAnalytics = { items: [],
    order_id: req.body.order_id };
  return Promise.all(req.body.items.map((e, i) => {
    return client.getAsync(e);
  }))
  .then(result => {
    console.log('right after redis', result);
    result.forEach((e, i) => {
     if (e !== null) {
      sendToAnalytics.items.push({
        id: req.body.items[i],
        category_id: e.split(' ')[0],
        category_name: e.split(' ')[1]
      })
      } else {
        categoriesNotFound.push(req.body.items[i]);
      }
    })
    return categoriesNotFound;
  })
  .then(() => {
    if (categoriesNotFound.length !== 0) {
      console.log(categoriesNotFound);
      return db.getCategory(categoriesNotFound)
    }
  })
  .then(result => {
    if (result !== undefined) {
      result.forEach((e, i) => {
        sendToAnalytics.items.push({
          id: e.item_id,
          category_id: e.category_id,
          category_name: e.name
        })
        let itemId = e.item_id;
        let category = result[i].category_id + ' ' + result[i].name;
        client.setAsync(itemId, category);
      })
    }
  })
  .then(() => {
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
    // item.order_id = order_id;
    return db.getQuantity(item);
  }))
  .then(result => {
    // result.forEach(e => {
    //   e[0].order_id = order_id;
    // })
    result.forEach(e => {
      e[0].order_id = order_id;
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


