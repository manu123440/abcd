const express = require('express');

const router = express.Router();

router.get('/checkout', (req, res, next) => {
	return res.render('payButton');
})

module.exports = router;