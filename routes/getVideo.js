const express = require('express');

const { param, body, validationResult } = require('express-validator');

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

router.get('/video/:id',
	[
		param('id')
      .trim()
      .notEmpty()
      .withMessage('ID Required')
      .matches(/^[0-9]*$/)
      .withMessage('Only Characters with numbers are allowed'),
    body('phno').custom(value => {
      const phoneNumberRegex = /^\+\d+\s\d*$/;

      if (!phoneNumberRegex.test(value)) {
        throw new Error('Invalid phone number format');
      }

      // Return true to indicate the validation succeeded
      return true;
    }),
	],
	async (req, res, next) => {
		const { id } = req.params;

		const { phno } = req.body;

		// console.log(id);

		let opt1 = selectFunction(
			"select no_of_days from users where phone = '"
				.concat(`${phno}`)
				.concat("'")
		);

		// console.log(opt1);

		try {
			const error = validationResult(req);

			if (!error.isEmpty()) {
				// console.log(error.array());
				return res.json({
					isSuccess: false,
					videoUrl: "",
					errorMessage: error.array()[0].msg
				})
			}

			else {
				request(opt1, (error, response) => {
          if (error) throw new Error(error);
					else {
						let y = JSON.parse(response.body);

						// console.log(y);

						if (y.length >= 1 && Number(y[0].no_of_days) >= 0) {
							const noOfDays = Number(y[0].no_of_days);

							// console.log(noOfDays);

							let opt2 = selectFunction(
								"select * from videos where video_id = '"
									.concat(`${id}`)
									.concat("'")
							);

							request(opt2, (error, response) => {
								if (error) throw new Error(error);
					      else {
					       	let x = JSON.parse(response.body);

					       	// console.log(x);

					       	if (x.length >= 1) {
					        	const video_url = x[0].video_url;
					        	return res.json({
											isSuccess: true,
											videoUrl: video_url,
											errorMessage: ""
										})
					       	}

					       	else {
					        	return res.json({
											isSuccess: false,
											videoUrl: "",
											errorMessage: "No data found..."
										})
					       	}
					      }
							})
						}
						else {
							return res.json({
								isSuccess: false,
								videoUrl: "",
								errorMessage: "No data found..."
							})
						}
					}
				})
			}
		}

		catch(error) {
			return res.json({
				isSuccess: false,
				videoUrl: "",
				errorMessage: "No data found..."
			})
		}
})

module.exports = router;