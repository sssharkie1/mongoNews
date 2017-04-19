// modules:
var request = require('request');
var cheerio = require('cheerio');
var mongojs = require('mongojs');

// MongoDB configuriation:
var databaseUrl = "CheerioMongoScraper";
var collections = ["articles"];

// use mongojs to hook the database to the db variable
var db = mongojs(databaseUrl, collections);

// this makes sure that any errors are logged if mongodb runs into an issue
db.on('error', function(err) {
  console.log('Database Error: ', err);
});

// REQUEST — index.handlebars
db.articles.findOne({}, function(err, data) {
  if (data === null) {
    var options = {
      url: 'http://waterfordwhispersnews.com/',
      headers: {
        'User-Agent': 'request'
      }
    };
    //main request to retrieve data and store into mongodb
    request(options, function(error, response, html) {
      if (error) throw error;
      var results = [];
      var $ = cheerio.load(html);
      $('article').each(function(i, element) {
        var title = $(this).find('h2').text().trim();
        var summary = $(this).find('p').text().trim();
        var link = $(this).find('a').attr('href');
        console.log(link)


          var obj = {
            title: title,
            summary: summary,
            link: link
          };
          results.push(obj);

      }); 

      db.articles.insert(results, function(err, data) {
        if (err) throw err;
      });
    }); // END request
  }
});

module.exports = function(app) {

  app.get('/', function(req, res) {
    db.articles.find({}, function(err, data) {
      if (err) throw err;
      res.render('index', {
        results: data
      });
    });
  });

  app.post('/comment', function(req, res) {
    // add comments to the database using ObjectId
    var id = req.body._id;
    var comment = req.body.comment;
    db.articles.update({
      "_id": mongojs.ObjectId(id)
    }, {
      $push: {
        "comment": comment
      }
    }, function(err, data) {
      if (err) throw err;
      db.articles.find({
        "_id": mongojs.ObjectId(id)
      }, function(err, data) {
        if (err) throw err;
        res.json(data);
      });
    });
  });

  // DELETE:
  app.post('/commentDelete', function(req, res) {
    // delete comments by searching database using the ObjectId
    var id = req.body._id;
    var comment = req.body.comment;
    db.articles.update({
      "_id": mongojs.ObjectId(id)
    }, {
      $pull: {
        "comment": comment
      }
    }, function(err, data) {
      if (err) throw err;
      db.articles.find({
        "_id": mongojs.ObjectId(id)
      }, function(err, data) {
        if (err) throw err;

        res.json(data);
      });
    });

  });

  // get comments for specific articles based on :id in the URL
  app.get('/comment/:id', function(req, res) {
    var id = req.params.id;
    db.articles.find({
      "_id": id
    }, function(err, data) {
      if (err) throw err;

    });
  });
};
