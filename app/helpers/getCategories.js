var Categories = require('../models/categories');

module.exports.getCategories = function() {
  var catArray = [];
  Categories.forge().orderBy('name', 'ASC').fetchAll().then(function(cats) {
    cats.models.forEach(function(ModelBase) {
      catArray.push({id: ModelBase.attributes.id, name: ModelBase.attributes.name});
    });
  });
  return catArray;
};

