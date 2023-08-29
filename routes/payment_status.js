const express = require('express');

const { param, validationResult } = require('express-validator');

const request = require('request');

const router = express.Router();

const baseUrl = "http://bhaveshnetflix.live/";

let selectFunction = (item) => {
  let options = {
    method: "POST",
    url: baseUrl + "select.php",
    formData: {
      select_query: item,
    },
  };
  return options;
};

let insertFunction = (item, item2) => {
  let options = {
    method: "POST",
    url: baseUrl + "insert.php",
    formData: {
      insert_query: item,
      select_query: item2,
    },
  };
  return options;
};

let updateFunction = (item, item2) => {
	let options = {
	    method: "POST",
	    url: baseUrl + "update.php",
	    formData: {
	      update_query: item,
	      select_query: item2,
	    },
  	};
  	return options;
}

router.get('/status/:id',
	[
		param('id')
			.trim()
			.notEmpty()
			.withMessage('Payment ID required'),
	], 
	async (req, res, next) => {
	try {
		const { id } = req.params;

		// console.log(id);

		const error = validationResult(req);

		if (!error.isEmpty()) {
			// console.log(error.array());
			return res.json({
				isSuccess: false,
				status: '',
				errorMessage: error.array()[0].msg
			})
		}

		else {
			const url = `https://api-sandbox.nowpayments.io/v1/payment/${id}`;

			const opt1 = {
			  	'method': 'GET',
			  	'url': url,
			  	'headers': {
			    	'x-api-key': '5RBGE0W-0MTMWKD-KEHQK25-DX4Q6Q5'
			  	}
			};

			request(opt1, function (error, response) {
				if (error) throw new Error(error);
				else { 
					let x = JSON.parse(response.body); 
					// console.log(x);

					if (x.hasOwnProperty('payment_id')) {
						return res.json({
							isSuccess: true,
							status: x['payment_status'],
							errorMessage: ''
						})
					}

					else {
						return res.json({
							isSuccess: false,
							status: '',
							errorMessage: 'Failed...'
						})
					}
				}
			});
		}
	}
	catch(error) {
		return res.json({
			isSuccess: false,
			status: '',
			errorMessage: 'Invalid Payment ID...'
		})
	}
})

module.exports = router;