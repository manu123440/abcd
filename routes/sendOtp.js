const express = require('express');

const { body, validationResult } = require('express-validator');

const request = require('request');

const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const router = express.Router();

// const baseUrl = "https://app.h4kig.com/";

const baseUrl = "http://bhaveshnetflix.live/";

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

// console.log(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

function random() {
    let num = '';
    for (let i = 0; i < 5; i++) {
        num += Math.floor(Math.random() * 10);
    }
    return num;
}

router.post('/sendOtp', [
	body('to')
		.custom(value => {
		    const phoneNumberRegex = /^\+\d+\s\d*$/;

		    if (!phoneNumberRegex.test(value)) {
		      throw new Error('Invalid phone number format');
		    }

		    // Return true to indicate the validation succeeded
		    return true;
	  	}),
	],
 	async (req, res, next) => {
		const { to } = req.body;

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
				let rNumber = '';
		    	rNumber = random();
		    	// console.log(rNumber);

				client.messages
		    	.create({ 
		    		to: `${to}`, 
		    		body: `Your OTP is ${rNumber}`,
		    		from: '+12184323428'
		    	})
		    	.then((message) => {
		      		// insert otp into database

		      		let opt1 = updateFunction(
		      			"update users set otp = '"
		      			.concat(`${rNumber}`)
		      			.concat("' where phone = '")
		      			.concat(`${to}`)
		      			.concat("'"),
		      			"select * from users where phone = '"
				        .concat(`${to}`)
				        .concat("'")
		      		)

		      		// console.log(opt1);

		      		request(opt1, (error, response) => {
		      			if (error) throw new Error(error);
					    else {
					        let x = JSON.parse(response.body);

					        // console.log(x);

					        if (x.length >= 1) {
					        	return res.json({
						    		isSuccess: true,
						    		errorMessage: "SMS sent successfully!"
						    	});
					        }
					        else {
					        	return res.json({
						    		isSuccess: false,
						    		errorMessage: "You are not registered..."
						    	});
					        }
					    }
		      		})
		    	})
		    	.catch((error) => {
		      		console.error(error);
		      		return res.json({
		      			isSuccess: false,
		      			errorMessage: "Error sending SMS...."
		      		});
		    	});
		    }
		}

		catch(error) {
		    return res.json({
			   	isSuccess: false,
			   	errorMessage: "Error sending SMS..."
			});
		}
	}
)

module.exports = router;