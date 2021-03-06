var express = require('express');
var router = express.Router();
var PhotoArticle = require('../models/photo_article.js');
var multer = require('multer');
var upload = multer({ dest: 'public/images/photo_article_images/'});
var processImages = require('../helper/modify_and_upload.js');
var Photo = require('../models/photo.js');
var RouterHelper = require('../helper/router_helper.js');

router.get('/', function(req, res) {
	PhotoArticle.find({ region: req.region._id }).populate('photo author').lean().exec(function(err, photoArticles) {
		res.render('photo_articles/index.jade', { region: req.region, photo_articles: photoArticles });
	});
});

router.get('/new', RouterHelper.checkUserLoggedIn, function(req, res) {
	var renderParams = {
		region: req.region,
		redirect_url: req.query.redirect_url ? encodeURIComponent(req.query.redirect_url) : ""
	};

	res.render('photo_articles/new.jade', renderParams);
});

router.post('/create', RouterHelper.checkUserLoggedIn, upload.single('photo'), processImages(function(req) { return [req.file]; }, { type: 'PhotoArticle', saves: 'thumbnail masonry' }), RouterHelper.processTags(function(req) {
	return req.body.tags.split(';');
}), function(req, res) {
	var values = req.processedImages.files.map(function(fileInfo) {
		return {
			original: fileInfo.original,
			thumbnail: fileInfo.thumbnail,
			masonry: fileInfo.masonry,
			owner: req.user._id
		};
	});

	Photo.create(values, function(err, photos) {
		if (err) { 
			console.log(err);
			res.redirect('/');
		} else {
			PhotoArticle.create({ author: req.user._id, region: req.region._id, description: req.body.description, photo: photos[0]._id, tags: req.tags }, function(err) {
				if (err) {
					console.log(err);
				}
				res.redirect(RouterHelper.tryUseRedirectUrl(req.query.redirect_url, 'back'));
			});
		}
	});
});

router.get('/:id', function(req, res) {
	PhotoArticle.findById(req.params.id, function(err, photoArticle) {
		res.render('photo_articles/show.jade', { region: req.region, photo_article: photoArticle });
	});
});



module.exports = router;
