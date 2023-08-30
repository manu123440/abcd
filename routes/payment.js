const express = require('express');

const { body, validationResult } = require('express-validator');

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
};

router.post('/payment',
	[
		body('phno').custom(value => {
		    // Regular expression to match international phone numbers

		    const phoneNumberRegex = /^\+\d+\s\d*$/;

		    if (!phoneNumberRegex.test(value)) {
		      throw new Error('Invalid phone number format');
		    }

		    // Return true to indicate the validation succeeded
		    return true;
		}),
		body('id')
			.trim()
			.notEmpty()
			.withMessage('Order ID required'),
		body('currency')
      .trim()
      .notEmpty()
      .withMessage('Currency required')
      .isIn(['btc', 'eth', 'usdt', 'ada', 'bnb', 
                'xrp', 'sol', 'dot', 'doge', 'ltc'])
      .withMessage('This is not a valid Currency'),
	],
 	async (req, res, next) => {
		const { phno, id, currency } = req.body;

		// fetch data from database
		let opt1 = selectFunction(
			"select * from users where phone = '"
				.concat(`${phno}`)
				.concat("'")
		);

		try {
			const error = validationResult(req);

			if (!error.isEmpty()) {
				// console.log(error.array());
				return res.json({
					isSuccess: false,
					address: '',
			    errorMessage: error.array()[0].msg
				})
			}

			else {
				request(opt1, (error, response) => {
					if (error) throw new Error(error);
					else {
						let opt2 = selectFunction(
							"select amount from plan where id = '"
								.concat(`${id}`)
								.concat("'")
						);

						request(opt2, function (error, response) {
						  if (error) throw new Error(error);
						  else {
						  	let x = JSON.parse(response.body);

						  	// console.log(x);

						  	if (x.length >= 1) {
									const modifiedNumber = phno.replace(/\+/g, '').replace(/\s/g, '_');

									// console.log(modifiedNumber);

						  		let options = {
									  'method': 'POST',
									  'url': 'https://api-sandbox.nowpayments.io/v1/payment',
									  'headers': {
									    'x-api-key': '5RBGE0W-0MTMWKD-KEHQK25-DX4Q6Q5',
									    'Content-Type': 'application/json'
									  },
									  body: JSON.stringify({
									    "price_amount": x[0].amount,
									    "price_currency": 'eur',
									    "pay_currency": currency,
									    "ipn_callback_url": `https://abcd-4wlf.onrender.com/v1/notify/?phno=${modifiedNumber}&plan=${id}`,
									    "order_id": id,
									    "case": "success"
									  })
									};

									request(options, (error, response) => {
									  if (error) throw new Error(error);
									  else {
									  	let y = JSON.parse(response.body);

									  	// console.log(y);

									  	if (y.hasOwnProperty('payment_id')) {
									  		// update payment_id in db

									  		let opt3 = updateFunction(
													"update users SET payment_id = '"
														.concat(`${y['payment_id']}`)
														.concat("' where phone = '")
														.concat(`${phno}`)
														.concat("'"),
													"select * from users where phone = '"
														.concat(`${phno}`)
														.concat("'")
												);

												request(opt3, (error, response) => {
												  if (error) throw new Error(error);
												  else {
												  	let z = JSON.parse(response.body);

												  	// console.log(z);

												  	if (z.length >= 1) {
												  		return res.json({
													  		isSuccess: true,
													  		address: y.pay_address,
													  		errorMessage: ''
													  	})
												  	}

												  	else {
												  		return res.json({
													  		isSuccess: false,
													  		address: '',
													  		errorMessage: 'failed...'
													  	})
												  	}
												  }
												})
									  	}
									  	else {
									  		return res.json({
										  		isSuccess: false,
										  		address: '',
										  		errorMessage: 'failed...'
										  	})
									  	}
									  }
									});
						  	}

						  	else {
						  		return res.json({
										isSuccess: false,
										address: '',
								    errorMessage: 'Invalid Plan ID...'
									})
						  	}
						  }
						});
					}
				})
			}
		}
		catch(error) {
			// console.log(error);
			return res.json({
				isSuccess: false,
				address: '',
			  errorMessage: "Invalid phone number, Try Again...."
			})
		}
	}
)

module.exports = router;
