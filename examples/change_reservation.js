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
var count =1;
var comeBack =1;
var availableSeat;
var fullSeatMap = {};
var message = "This is error msg. Please let admin knows."
var isAvailable;

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
            message = "Your reservation has been changed successfully."
            resolve();
          }
      })
    });
}



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

function message_generation(date, username) {
  return new Promise(function (resolve, reject) {

    currentDate  = date;
    startingTime = currentDate + "T09:00:00";
    endingTime = currentDate + "T18:01:45";

    var availableSeatByUserURL = baseUrl+ "reservations/findByUser?email=" + username+ "&startingTime="+ startingTime +"&endingTime=" + endingTime;
    var deleteReservationURL = "";

    var options = {
        url: availableSeatByUserURL,
        method: 'GET',
        headers: headers
    }
    console.log("availableSeatByUserURL", availableSeatByUserURL);
    request(options, function (error, response, body) {
      console.log("error",error);

        console.log("response.statusCode", response.statusCode);

        if (!error && response.statusCode == 200) {
            console.log("this is working1111",body);
            var seatList = JSON.parse(body);
            if(seatList.length == 0){
                message = "We cannot find your reservation for "+ date + ". Please make sure and try again. ";
                resolve();
            }else{
              deleteReservationURL = baseUrl+ "reservations/" +  seatList[0].id;
              var options_delete = {
                  url: deleteReservationURL,
                  method: 'DELETE',
                  headers: headers
              };
              request(options_delete, function (error, response, body) {
                  if (!error && (response.statusCode == 200 ||response.statusCode == 204)) {
                    message_generation_available(date, username).then(
                        function(){
                          message = "Your reservation for " + date + " has been successfully deleted. Where do you want to sit? This is available seat for you : " + availableSeat;
                          comeBack = 2;
                          count =2;
                          resolve();
                        }, function(){

                            console.log("you fail");
                            reject();
                        });



                  }
              });
            }
        }
    })

    });

}


module.exports = {

        metadata: () => (
        {
            "name": "change_reservation",
            "properties": {
              "date": { "type": "string", "required": true },
              "username": { "type": "string", "required": true }
            },
            "supportedActions": []
        }
    ),

    invoke: (conversation, done) => {

      const nlpvalue = conversation.properties().date;
      console.log("conversation.properties().nlp", conversation.properties().date);
      var regResult = nlpvalue.match(new RegExp("date=[0-9]*"));
      if(regResult== null){
        conversation.reply({ text: "Please input valid date."});
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
      
        console.log(">>>>>>properties : ",conversation.properties());
        console.log(">>>>>>request : ",conversation.request());

        var TextFromUser = conversation.request().message.payload.message.text;
        console.log("TextFromUser- canceling",TextFromUser);

        if(count == 1) {

        message_generation(date, username).then(
            function(){
                //resolve;
                console.log("this is cool");
                conversation.reply({ text: message});
                conversation.keepTurn(false);
                if(comeBack ==1){
                  conversation.transition();
                }
                done();
            },
            function(){
                //reject;

            });
      }else{
        var results = TextFromUser.match(new RegExp("12(3|4)[0-9][0-9]"));
        console.log("results", results);
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

            }


    }
};
