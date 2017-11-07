const mysql = require('mysql');
const request = require('request-promise'); 
const expect = require('chai').expect;
const Promise = require('bluebird');
const axios = require('axios');

describe('Inventory Database', function() {
  let dbConnection;

  beforeEach(function(done) {
    dbConnection = Promise.promisifyAll(mysql.createConnection({
        user: 'root',
        password: '',
        database: 'test'
      }));

    dbConnection.connect();

    dbConnection.queryAsync(`SET FOREIGN_KEY_CHECKS = 0`)
    .then(() => {
      return dbConnection.queryAsync(`category`)
    })
    .then(() => {
      return dbConnection.queryAsync(`image`)
    })
    .then(() => {
      return dbConnection.queryAsync(`item_detail`)
    })
    .then(() => {
      return dbConnection.queryAsync(`item`)
    })
    .then(() => {
      return dbConnection.queryAsync(`item_history`)
    })
    .then(() => {
      return dbConnection.queryAsync(`seller`)
    })
    .then(() => {
      return dbConnection.queryAsync(`seller_item`)
    })
    .then(() => {
      return dbConnection.queryAsync(`SET FOREIGN_KEY_CHECKS = 1`)
    })
    .then(() => done(), done);
  });

  afterEach(function() {
    dbConnection.end();
  });

  it('Should insert posted category to the DB', function(done) {
    // Post a category
    const category = {
        name: 'Amazon Device Accessories Sub-Category1',
        parent_id: 1 
      };
    request.post('http://localhost:3000/addCategory').form(JSON.stringify(category))
    .then(result => {
      return dbConnection.queryAsync(`SELECT * FROM category`)
      .then(result => {
        expect(results.length).to.equal(1);
        done();    
      })     
    })
  });

  xit('Should insert posted images the DB', function(done) {
       var queryString = "";
       var queryArgs = [];
    connection.query(queryString, queryArgs, function(err) {
      if (err) { throw err; }

      // Now query the Node chat server and see if it returns
      // the message we just inserted:
      request('http://localhost:3000/image', function(error, response, body) {
        var messageLog = JSON.parse(body);
        expect(messageLog[0].text).to.equal('Men like you can never change!');
        done();
      });
    });
  });
});







