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

router.get('/status/:phno',
	[
		param('phno').custom(value => {
		    // Regular expression to match international phone numbers

		    const phoneNumberRegex = /^\+\d+\s\d*$/;

		    if (!phoneNumberRegex.test(value)) {
		      throw new Error('Invalid phone number format');
		    }

		    // Return true to indicate the validation succeeded
		    return true;
		})
	], 
	async (req, res, next) => {
	try {
		const { phno } = req.params;

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
			let opt1 = selectFunction(
			  "select * from users where phone = '"
			    .concat(`${phno}`)
			    .concat("'")
			);

			request(opt1, (error, response) => {
				if (error) throw new Error(error);
				else { 
					let y = JSON.parse(response.body);

					// console.log(y);

					if (y.length >= 1) {
						const id = y[0]['payment_id'];

						// console.log(id);

						if (id !== null) {
							const url = `https://api-sandbox.nowpayments.io/v1/payment/${id}`;

							const opt2 = {
							  'method': 'GET',
							  'url': url,
							  'headers': {
							   	'x-api-key': '5RBGE0W-0MTMWKD-KEHQK25-DX4Q6Q5'
							  }
							};

							request(opt2, function (error, response) {
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

						else {
							return res.json({
								isSuccess: false,
								status: '',
								errorMessage: 'You are not a subscriber...'
							})
						} 
					}

					else {
						return res.json({
							isSuccess: false,
							status: '',
							errorMessage: 'Failed...'
						})
					} 
				}
			})
		}
	}
	catch(error) {
		return res.json({
			isSuccess: false,
			status: '',
			errorMessage: 'Invalid Phone Number...'
		})
	}
})

module.exports = router;
