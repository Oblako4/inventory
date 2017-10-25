const express = require('express');
const bodyParser = require('body-parser');
const db = require('../db/index');
const app = express();
const http = require('http');

app.use(bodyParser.json());


