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
}

router.post('/notify', async (req, res, next) => {
	const phone = req.query.phno;
  	const planId = req.query.plan;

	const replacedPhno = phone.replace(/_/g, " ").replace(/^(\d+)/, "+$1");

	console.log(replacedPhno);

  	let opt1 = selectFunction(
    	"select * from users where phone = '"
        	.concat(`${replacedPhno}`)
        	.concat("'")
  	);

	try {
    request(opt1, (error, response) => {
      if (error) throw new Error(error);
      else {
        let x = JSON.parse(response.body);

        const currentDate = new Date();

        // Convert the date to a MySQL-compatible datetime string
        const subDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');

        // console.log(subDate);

        let opt2 = updateFunction(
          "update users set sub_date = '"
            .concat(`${subDate}`)
            .concat("', paid = 'true', plan_id = '")
            .concat(`${planId}`)
            .concat("', status = 'active' where phone = '")
            .concat(`${replacedPhno}`)
            .concat("'"),
          "select * from users where phone = '"
            .concat(`${replacedPhno}`)
            .concat("'")
        );

        request(opt2, (error, response) => {
          if (error) throw new Error(error);
          else {
            let z = JSON.parse(response.body);

            // console.log(z);

            if (z.length >= 1) {
              return res.json({
                success: true
              })
            }

            else {
              return res.json({
                success: false
              })
            }
          }
        })
      }
    })
	}
	catch(error) {
		return res.json({
            success: false
    })
	}
})

module.exports = router;
