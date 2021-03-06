var Database = require('../config/db');

require('./locations');

var People = Database.Model.extend({
  tableName: 'People',
  hasTimestamps: true,
  location: function() {
    return this.belongsTo('Locations', 'location_id');
  }
});

module.exports = Database.model('People', People);
