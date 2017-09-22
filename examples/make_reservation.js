"use strict";

var log4js = require('log4js');
var logger = log4js.getLogger();
var request = require('request');
var moment = require('moment');

var availableSeat;
var count = 1;
var userReservation;
var fullSeatMap = {};
var headers = {
  'Content-Type' : 'application/json',
  'Accept' : 'application/json',
  'Authorization' : 'Basic c3VuZy5oeWUuamVvbkBvcmFjbGUuY29tOndlbGNvbWUx'
}
var currentDate;
var startingTime;
var endingTime;
var baseUrl = "http://129.150.84.190:8080/v1/";
var isAvailable;
var message = "This is error msg. Please let admin knows."


//no dep
function message_generation_available(date, username) {
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

      request(options, function (error, response, body) {
          console.log(error);
          console.log("availableSeatURL", availableSeatURL);

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
              resolve();
          }
      })
    });
}


function message_generation_available_user(date, username) {
    return new Promise(function (resolve, reject) {

  var availableSeatByUserURL = baseUrl+ "reservations/findByUser?email=" + username+ "&startingTime="+ startingTime +"&endingTime=" + endingTime;
  var options_user = {
      url: availableSeatByUserURL,
      method: 'GET',
      headers: headers
  }
  request(options_user, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          userReservation = JSON.parse(body);
          resolve();
      }
  })
});
}



function message_generation_make_new(date, username) {
    return new Promise(function (resolve, reject) {
      var reservationUrl = baseUrl+ "reservations/";
      var options_reservation = {
          url: reservationUrl,
          method: 'POST',
          headers: headers,
          json:true,
          body : {
            "email" : username,
            "endingTime" : endingTime,
            "reservationDate" : currentDate,
            "seatNo" : isAvailable.seatNo,
            "startingTime" : startingTime
          }
      };
        request(options_reservation, function (error, response, body) {
        console.log("response.statusCode",response.statusCode);

          if (!error && response.statusCode == 200) {
            message = "Your reservation has been made successfully."
            resolve();
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
                "username": { "type": "string", "required": true }
            },
            "supportedActions": []
        }
    ),

    invoke: (conversation, done) => {
        console.log(conversation);
        var nlpvalue = conversation.properties().date;

        var nlpvalue2 = conversation.properties().username.toLowerCase();
        var regResult1 = nlpvalue2.match(new RegExp('[A-Za-z0-9._%+-]*@oracle.com'));
        console.log(">>>>>>>>>regResult1", regResult1 );
        if(regResult1== null){
          conversation.reply({ text: "Please enter valid oracle email."});
          conversation.keepTurn(false);
          conversation.transition();
          done();
          return;
        }
        const username = regResult1[0];

        var regResult = nlpvalue.match(new RegExp("date=[0-9]*"));
        if(regResult== null){
          conversation.reply({ text: "Please enter valid date."});
          conversation.keepTurn(false);
          conversation.transition();
          done();
          return;
        }

        var gettingDate = (regResult[0]).split('=')[1];
        var utcSeconds = gettingDate.substring(0, gettingDate.length -3);
        var date = new Date(0); // The 0 there is the key, which sets the date to the epoch
        date.setUTCSeconds(utcSeconds);
        date = (JSON.stringify(date).split('T')[0]).substring(1, date.length);

        var TextFromUser = conversation.request().message.payload.message.text;
        console.log(">>>>>>>username",username);
        message_generation_available(date, username).then(
            function () {
              if(count == 1) {
                message_generation_available_user(date, username).then(
                  function(){
                    console.log("first");
                    if(userReservation != ""){
                      console.log("userReservation is not empty");
                      conversation.reply({ text: "You've already made a reservation for "+ date + ". " });
                      conversation.transition();
                    } else{
                      conversation.reply({ text: 'this is available seat for you :' + availableSeat });
                      conversation.reply({ text: "Please enter where you want to seat." });
                      conversation.keepTurn(false);
                      count++;
                    }
                    done();
                },
                  function(){
                  }
                );
            }else{
                var results = TextFromUser.match(new RegExp("12(3|4)[0-9][0-9]"));
                if(results == null){
                  message = "I am sorry. I didn't understand what you mean.";
                  conversation.reply({ text: message});
                  conversation.transition();
                  count--;
                  done();
                }
                isAvailable = fullSeatMap[results[0]];
                if(isAvailable == null || isAvailable == undefined){
                    message = "Please select available seat. Your Choices are " + availableSeat;
                    conversation.reply({ text: message});
                    conversation.keepTurn(false);
                    done();
                }
                else{
                  message_generation_make_new(date, username).then(
                      function(){
                        conversation.reply({ text: message});
                        console.log("yaaas");
                        conversation.keepTurn(false);
                        conversation.transition();
                        count--;
                        console.log("reply");
                        done();

                      },function(){
                        conversation.reply({ text: "weird"});
                        conversation.keepTurn(false);
                        conversation.transition();
                        count--;
                        console.log("reply");
                        done();
                      });
                }
            }}, function () {
                conversation.reply("Error Message");
                done();
            });

    }
};
