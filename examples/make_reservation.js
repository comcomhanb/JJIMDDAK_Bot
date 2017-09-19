"use strict";

var log4js = require('log4js');
var logger = log4js.getLogger();
var request = require('request');
var availableSeat;
var count = 1;
var userReservation;
var fullSeatMap = {};
var headers = {
  'Content-Type' : 'application/json',
  'Accept' : 'application/json'
}
var currentDate;
var startingTime;
var endingTime;
var baseUrl = "https://msrapi-gse00013250.apaas.us6.oraclecloud.com/v1/";

function message_generation(date, username) {

    return new Promise(function (resolve, reject) {

      currentDate  = date;
      startingTime = currentDate + "T09:00:00";
      endingTime = currentDate + "T18:01:45";

      var availableSeatURL = baseUrl+ "reservations/findAvailableSeats?startingTime="+ startingTime +"&endingTime=" + endingTime;
      var availableSeatByUserURL = baseUrl+ "reservations/findByUser/" + username+  "?startingTime="+ startingTime +"&endingTime=" + endingTime;

      var options = {
          url: availableSeatURL,
          method: 'GET',
          headers: headers
      }
      var options_user = {
          url: availableSeatByUserURL,
          method: 'GET',
          headers: headers
      }


      request(options, function (error, response, body) {
          console.log(error);
          if (!error && response.statusCode == 200) {
              var seatList = JSON.parse(body);
              var availableSeatList = "";

              for(var i =0; i < seatList.length; i++ ){
                  if(i == 0 ) availableSeatList = seatList[i].seatNo;
                  else availableSeatList += ", " + seatList[i].seatNo;

                  var seat = seatList[i];
                  fullSeatMap[seat.seatNo] = seat;
              }
              availableSeat = availableSeatList;


              request(options_user, function (error, response, body) {
                  if (!error && response.statusCode == 200) {
                      console.log("availableSeatByUserURL",availableSeatByUserURL);
                      userReservation = JSON.parse(body);
                      resolve();
                  }
              })
          }
      })
    });
}


module.exports = {

        metadata: () => (
        {
            "name": "make_reservation",
            "properties": {
                "date": { "type": "string", "required": true },
          //      "seatNo": { "type": "string", "required": true },
                "username": { "type": "string", "required": true }
            },
            "supportedActions": []
        }
    ),

    invoke: (conversation, done) => {
        const date = "2017-10-27";
        const username = conversation.properties().username;
        console.log(conversation.properties());
        var TextFromUser = conversation.request().message.payload.text;
        console.log("TextFromUser",TextFromUser);

        message_generation(date, username).then(
            function () {

              if(count == 1) {
                console.log("first");
                conversation.reply({ text: 'date :' + date + ', username :' + username});
                conversation.reply({ text: 'this is available seat for you :' + availableSeat });
                conversation.reply({ text: "Please enter where you want to seat." });
                conversation.keepTurn(false);
                count++;
                done();
            }else{
                var results = TextFromUser.match(new RegExp("12(3|4)[0-9][0-9]"));
                console.log("results[map]", fullSeatMap[results[0]]);
                console.log("userReservation", userReservation);

                var isAvailable = fullSeatMap[results[0]];

                if(isAvailable == undefined){
                  console.log("isAvailable", isAvailable)
                  conversation.reply({ text: "Please select available seat."});
                }
                if(userReservation != ""){
                  console.log("userReservation", userReservation)
                  conversation.reply({ text: "You already made reservation for this day. Please try different date"});
                }
                else{
                    var reservationUrl = baseUrl+ "reservations/";
                    var options_reservation = {
                        url: reservationUrl,
                        method: 'POST',
                        headers: headers,
                        json: true,
                        body : {
                          "seatNo" : isAvailable.seatNo,
                          "email" : username,
                          "reservationDate" : currentDate,
                          "startingTime" : startingTime,
                          "endingTime" : endingTime
                        }
                    }

                    request(options_reservation, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                          //  console.log("availableSeatByUserURL",body);
                        }
                    })


                }

                conversation.keepTurn(false);
                conversation.transition();
                count--;
                done();
            }}, function () {
                conversation.reply("Error Message");
                done();
            });

    }
};
