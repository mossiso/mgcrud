var fs = require('fs');
var Database = require('../config/db');
var Tools = require('../models/tools');

var cats = require('../helpers/getCategories');
var locs = require('../helpers/getLocations');
var allCats = cats.getCategories();
var allLocs = locs.getLocations();

module.exports = {
  add(req, res) {
    res.render('tool');
  },
  delete(req, res) {
    Tools.forge({id: req.params.id}).fetch().then(function(tool) {
      if(tool.attributes.picture) {
        fs.unlink('./app/public/uploads/' + tool.attributes.picture, function(err) {
          if (err) console.log(err);
        });
      }
      return Tools.forge({id: req.params.id}).destroy().then(function(model) {
        res.redirect('/tools/');
      })
      .catch(function(error) {
        res.render('error', {error: error, message: 'Can not delete item.', title: 'Tools'});
      });
    });
  },
  edit(req, res) {
    if (req.params.id) {
      return Tools.forge({id: req.params.id}).fetch().then(function(tool) {
        res.render('tool', {results: tool.attributes, categories: allCats, locations: allLocs, title: 'Tools' });
      });
    } else {
      res.render('tool', {locations: allLocs, categories: allCats, title: 'Tools'  });
    }
  },
  listAll(req, res) {
    var allTools = Database.Collection.extend({ model: Tools }); // make a collection so we can use withRelated
    return allTools.forge().orderBy('name', 'ASC').fetch({withRelated: ['location', 'category']}).then(function(tools) {
      res.render('tools-list', { results: tools.models, locations: allLocs, title: 'Tools' });
    })
    .catch( function(error){console.log(error);} );
  },
  single(req, res) {
    return Tools.forge({id: req.params.id}).fetch().then(function(tool) {
      res.render('tool', {results: tool.attributes, errors: false, title: 'Tools' });
    });
  },
  upsert(req, res) {
    var options = {};
    var toolID = '';
    var message = '';
    if (!req.params.id) {
      options.method = 'insert';
      message = 'Created Successfully!';
    } else {
      toolID = {id: req.params.id};
      options.method = 'update';
      options.patch = 'true';
      message = 'Updated Successfully!';
    }

    // Validate the input fields
    req.checkBody('toolName', 'The name or title of the tool must not be empty.').notEmpty();

    // SQL sanitizing happens in Postgres and knex level
    var values = {
      name: req.body.toolName,
      make: req.body.make,
      model: req.body.model,
      category_id: req.body.category,
      location_id: req.body.location,
      quantity: req.body.quantity,
    };

    if (req.file) {
      values.picture = req.file.filename;
      // Delete existing pic if there is one
      if(req.body.pic_name) {
        fs.unlink('./app/public/uploads/' + req.body.pic_name, function(err) {
          if (err) console.log(err);
        });
      }
    } else {
      values.picture = req.body.pic_name;
    }

    // Validation results
    req.getValidationResult().then(function(result) {
      if ( result.isEmpty() ) {
        return Tools.forge(toolID).save(values, options).then(function(tool) {
          res.render('tool', {results: tool.attributes, categories: allCats, locations: allLocs, message: message});
        });
      } else {
        if (placeID !== '') {
          return Tools.forge(toolID).fetch().then(function(tool) {
            res.render('tool', {results: tool.attributes, title: 'Tools', errors: result.array()});
          });
        } else {
          res.render('tool', {title: 'Tools', errors: result.array() });
        }

      }
    });  
  },
};
