const mysql = require('mysql');
const request = require('request-promise'); 
const expect = require('chai').expect;
const Promise = require('bluebird');
const db = require('../db/index.js');


describe('Inventory Database', function() {
  const dbConnection;

  beforeEach(function(done) {
    dbConnection = mysql.createConnection({
      user: 'root',
      password: '',
      database: 'test'
    });

    dbConnection.connect();

    dbConnection.querAsync(`SET FOREIGN_KEY_CHECKS = 0`)
    .then(() => {
      return dbConnection.querAsync(`category`)
    })
    .then(() => {
      return dbConnection.querAsync(`image`)
    })
    .then(() => {
      return dbConnection.querAsync(`item_detail`)
    })
    .then(() => {
      return dbConnection.querAsync(`item`)
    })
    .then(() => {
      return dbConnection.querAsync(`item_history`)
    })
    .then(() => {
      return dbConnection.querAsync(`seller`)
    })
    .then(() => {
      return dbConnection.querAsync(`seller_item`)
    })
    .then(() => {
      return dbConnection.querAsync(`SET FOREIGN_KEY_CHECKS = 1`)
    })
    .then(() => {
      done()
    })
  });

  afterEach(function() {
    dbConnection.end();
  });

  it('Should insert posted category to the DB', function(done) {
    // Post a category
    request({
      method: 'POST',
      uri: 'http://127.0.0.1:3000/addCategory',
      json: { id: 36,
              name: 'Amazon Device Accessories Sub-Category1',
              parent_id: 1 }
    }, function () {
        const queryString = 'SELECT * FROM category';

        db.querAsync(queryString, queryArgs, function(err, results) {
          // Should have one result:
          expect(results.length).to.equal(1);

          // TODO: If you don't have a column named text, change this test.
          // expect(results[0].text).to.equal('In mercy\'s name, three days is all I need.');

          done();
      });
    });
  });

  xit('Should output all messages from the DB', function(done) {
    // Let's insert a message into the db
       var queryString = "";
       var queryArgs = [];
    // TODO - The exact query string and query args to use
    // here depend on the schema you design, so I'll leave
    // them up to you. */

    dbConnection.query(queryString, queryArgs, function(err) {
      if (err) { throw err; }

      // Now query the Node chat server and see if it returns
      // the message we just inserted:
      request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
        var messageLog = JSON.parse(body);
        expect(messageLog[0].text).to.equal('Men like you can never change!');
        expect(messageLog[0].roomname).to.equal('main');
        done();
      });
    });
  });
});