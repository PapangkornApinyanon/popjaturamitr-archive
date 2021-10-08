const { MongoClient } = require('mongodb');
const db = require('../lib/db')

module.exports = function(app, client){

    var db = client.db('popjaturamitr');

    app.get('/clicks/leaderboard', async (req, res) => {
        var cursor  = await db.collection('collection').find({}).toArray();
        res.send(cursor)
    })

    app.post('/clicks/', async (req, res) => {
        var clicks = parseInt(req.query.c);
        if (clicks > 800) {
            clicks = 0;
        };
        await db.collection('collection').updateOne({_id: 'Total'}, {$inc: {total: clicks}}, (err, result) => {
            if (err) {
                res.send({ 'error': `An error has occured ${err}`})
            } else {
                //res.send(result)
            }
        })

        var guild = req.query.g;
        if (guild != "NN"){
            await db.collection('collection').updateOne({_id: guild}, {$inc: {count: clicks}}, (err, result) => {
                if (err) {
                    res.send({ 'error': `An error has occured ${err}`})
                } else {
                    //res.send(result)
                }
            })
        }   
    })
}