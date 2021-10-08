const mongoose = require("mongoose");
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const express = require('express');
const app  = express();
const port = process.env.PORT || 8080;
const db = require('./lib/db')
const cors = require('cors');
const rateLimit = require("express-rate-limit");

//app.use(bodyParser.urlencorded( { extended: true }))



MongoClient.connect(db.uri, async (err, database) => {
    if (err) return console.log(err);
    require('./routes')(app, database);
    app.listen(port, () => {
        console.log(`We are live on ${port}`)
    })
});

app.use(cors({
    origin: '*'
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200 // limit each IP to 100 requests per windowMs
});

//  apply to all requests
//app.use(limiter);

module.exports = app;