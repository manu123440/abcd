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
					payment_id: '',
			    errorMessage: error.array()[0].msg
				})
			}

			else {
				request(opt1, (error, response) => {
					if (error) throw new Error(error);
					else {
						// const options = {
						//   method: 'POST',
						//   url: 'https://api-sandbox.coingate.com/api/v2/orders',
						//   headers: {
						//     accept: 'application/json',
						//     Authorization: 'Token BWodS1EkFyiKSVnu8vCJZA2DGtYSJnuirzvZMyde',
						//     'content-type': 'application/x-www-form-urlencoded'
						//   },
						//   form: {
						//     callback_url: 'http://localhost:3000/v1/notify',
						//     cancel_url: 'http://localhost:3000/v1/cancel',
						//     success_url: 'http://localhost:3000/v1/success',
						//     receive_currency: currency,
						//     price_currency: currency,
						//     price_amount: amount,
						//     order_id: id,
						//     purchaser_email: 'hi@gmail.com'
						//   }
						// };

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
						  		const amt = Number(x[0].amount);

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
									    "ipn_callback_url": "http://localhost:3000/v1/notify",
									    "order_id": id,
									  })
									};

									request(options, (error, response) => {
									  if (error) throw new Error(error);
									  else {
									  	let y = JSON.parse(response.body);

									  	// console.log(y);

									  	if (y.hasOwnProperty('payment_id')) {
									  		return res.json({
										  		isSuccess: true,
										  		payment_id: y.payment_id,
										  		errorMessage: ''
										  	})
									  	}
									  	else {
									  		return res.json({
										  		isSuccess: false,
										  		payment_id: '',
										  		errorMessage: 'failed...'
										  	})
									  	}
									  }
									});
						  	}

						  	else {
						  		return res.json({
										isSuccess: false,
										payment_id: '',
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
				payment_id: '',
			  errorMessage: "Invalid phone number, Try Again...."
			})
		}
	}
)

module.exports = router;