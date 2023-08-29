const express = require('express');

const { body, validationResult } = require('express-validator');

const request = require('request');

const router = express.Router();

router.post('/notify', async (req, res, next) => {
	// const phone = req.query.order_id;

	// const replacedPhno = phone.replace(/_/g, " ").replace(/^(\d+)/, "+$1");

	// console.log(replacedPhno);

	console.log("notify...");

	return res.send("notify success...");

	// try {}
	// catch(error) {}
})

module.exports = router;