const noteRoutes =  require('./clicks_route');

module.exports = function(app, db) {
    noteRoutes(app, db)
}