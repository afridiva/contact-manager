var request = require("request");
var url = "https://jusibe.com/smsapi/send_sms/";

describe('Contacts Manager', function(){

	// Check if add function returns 200
	it('should return status code 200', function(){
		request.get(url, function(error, response, body) {
        	expect(response.statusCode).toBe(200);
      	});
	});
});