"use strict";

var log4js = require('log4js');
var request = require('request');
var logger = log4js.getLogger();
var headers = {
  'Content-Type' : 'application/json',
  'Accept' : 'application/json',
  'Authorization' : 'Basic c3VuZy5oeWUuamVvbkBvcmFjbGUuY29tOndlbGNvbWUx'
}
var currentDate;
var startingTime;
var endingTime;
var baseUrl = "http://129.150.84.190:8080/v1/";

function message_generation(date, username) {
  return new Promise(function (resolve, reject) {

    currentDate  = date;
    startingTime = currentDate + "T09:00:00";
    endingTime = currentDate + "T18:01:45";

    var availableSeatURL = baseUrl+ "reservations/findAvailableSeats?email=" + username + "&startingTime="+ startingTime +"&endingTime=" + endingTime;

    var options = {
        url: availableSeatURL,
        method: 'GET',
        headers: headers
    }
    console.log("availableSeatURL", availableSeatURL);
    request(options, function (error, response, body) {
      console.log("error",error);

        console.log("response.statusCode", response.statusCode);

        if (!error && response.statusCode == 200) {
            console.log("this is working",body);
            resolve();
        }
    })

    });

}


module.exports = {

        metadata: () => (
        {
            "name": "cancel_reservation",
            "properties": {
              "date": { "type": "string", "required": true },
              "username": { "type": "string", "required": true }
            },
            "supportedActions": []
        }
    ),

    invoke: (conversation, done) => {

        const date = "2017-09-22";
        const username = conversation.properties().username;
        console.log(conversation.properties());
        var TextFromUser = conversation.request().message.payload.text;
        console.log("TextFromUser- canceling",TextFromUser);

        message_generation(date, username).then(
            function(){
                //resolve;
                console.log("this is cool");
                conversation.reply({ text: 'date :' + date + ', username :' + username});
                conversation.transition();
                done();
            },
            function(){
                //reject;

            });


    }
};
