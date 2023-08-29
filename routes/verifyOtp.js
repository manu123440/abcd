const express = require('express');

const { body, validationResult } = require('express-validator');

const request = require('request');

const router = express.Router();

// const baseUrl = "https://app.h4kig.com/";

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
}

router.post('/verifyOtp', 
	[
		body('phno').custom(value => {
		    // Regular expression to match international phone numbers
		    // const phoneNumberRegex = /^[+]\d{1,3}[.\s-]?\d{3,}([.\s-]?\d{2,}){2,}$/;
		    // const phoneNumberRegex = /^[0-9-.+]+$/;
		    const phoneNumberRegex = /^\+\d+\s\d*$/;

		    if (!phoneNumberRegex.test(value)) {
		      throw new Error('Invalid phone number format');
		    }

		    // Return true to indicate the validation succeeded
		    return true;
		}),
		body('otp')
			.trim()
			.notEmpty()
			.withMessage('OTP required')
			.isLength({ min: 5, max: 5 })
			.withMessage('contains 5 numbers only')
			.matches(/^[0-9]+$/)
			.withMessage('must be a valid otp')
	], 
	async (req, res, next) => {
		const { otp, phno } = req.body;

		// let isSuccess = false;

		// fetch otp from database
		let opt1 = selectFunction(
			"select otp from users where phone = '"
				.concat(`${phno}`)
				.concat("'")
		);

		// console.log(typeof number, typeof otp);

		try {
			const error = validationResult(req);

			if (!error.isEmpty()) {
				// console.log(error.array());
				return res.json({
					isSuccess: false,
			    errorMessage: error.array()[0].msg
				})
			}

			else {
				request(opt1, (error, response) => {
					if (error) throw new Error(error);
					else {
						let x = JSON.parse(response.body);

						// console.log(x);

						// console.log(x[0].otp, typeof x[0].otp, x.otp !== null);
						// const number = x[0].otp;

						if (x.length >= 1) {
							const number = x[0].otp;

							// console.log(number, Number(number) === Number(otp));

							if (number !== null && number !== '' && Number(number) === Number(otp)) {
								let opt2 = updateFunction(
									"update users set otp = 'null'"
										.concat("where phone = '")
                    .concat(`${phno}`)
                    .concat("'"),
                  "select * from users where phone = '"
                    .concat(`${phno}`)
                    .concat("'")
								);

								request(opt2, (error, response) => {
									if (error) throw new Error(error);
									else {
										let y = JSON.parse(response.body);

										// console.log(y);

										if (y.length >= 1) {
											return res.json({
												isSuccess: true,
												errorMessage: ''
											})
										}

										else {
											return res.json({
												isSuccess: false,
												errorMessage: 'Failed to update otp...'
											})
										}
									}
								})
							}

							else {
								return res.json({
									isSuccess: false,
							    errorMessage: "Invalid OTP, Try Again..."
								})
							}
						}

						else {
							return res.json({
								isSuccess: false,
						    errorMessage: "Invalid OTP, Try Again..."
							})
						}
					}
				})
			}
		}
		catch(error) {
			return res.json({
				isSuccess: false,
			  errorMessage: "Invalid OTP, Try Again..."
			})
		}
	}
);

module.exports = router;