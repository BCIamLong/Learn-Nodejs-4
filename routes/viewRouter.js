const express = require('express');
const viewController = require('../controllers/viewController');

const router = express.Router();

//*IMPLEMENT RENDER TEMPLATE ENGINE
// * so usually we use .route('url').get().post()... right but in this case we always manipulate with get to render view file so route() is not necessary

// router.get('/', viewController.getHomepage);

// * usually overview page is homepage '/'
router.get('/', viewController.getOverview);

router.get('/tours/:slug', viewController.getTour);

module.exports = router;
