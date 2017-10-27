const db = require('../db/index');
const _ = require('lodash');
const faker = require('faker');
const g = require('./generator.js');
const axios = require('axios');

// let's create the image records

var sendNewImage = () => {
  for (var i = 1; i <= 23; i++) {
    var nextImage = g.addImages(i);
    axios.post('http://localhost:3000/image', nextImage)
    .then(response => {
      console.log('success');
    })
    .catch(error => {
      console.log(error);
    });
  }
};

// sendNewImage();