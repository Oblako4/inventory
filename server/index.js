const Express = require('express');
const bodyParser = require('body-parser');
const db = require('../db/index');
const http = require('http');
const gen = require('../data/generator.js');
const cors = require('cors');

const app = Express();

app.use(bodyParser.json());
app.use(cors());

// use for initial load of parent categories to database
app.post('/addCategory', (req, res) => {
  if (req.body.length > 1) {
    req.body.forEach((e, i) => {
      db.addCategory(e);
    });
  } else {
    db.addCategory(req.body);
  }
  res.send(200);
})

app.post('/addSeller', (req, res) => {
  if (req.body.length > 1) {
    req.body.forEach((e, i) => {
      db.addSeller(e);
    });
  } else {
    db.addSeller(req.body);
  }
  res.send('added seller info');
})

app.get('/currentInventory', (req, res) => {
  res.send('hey');
})

app.get('/changeInventory', (req, res) => {
  res.send(gen.inventoryChange());
}) 

app.post('/inventoryUpdate', (req, res) => {
  res.send('this is inventoryUpdate');
})

app.listen(process.env.PORT || 3000, () => {
  console.log('Listening on Port 3000!');
});


