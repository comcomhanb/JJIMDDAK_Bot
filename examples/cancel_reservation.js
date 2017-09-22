"use strict";

var log4js = require('log4js');
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
var request = require('request');
var message = "this is error. Please let admin knows."
function message_generation(date, username) {
  return new Promise(function (resolve, reject) {

    currentDate  = date;
    startingTime = currentDate + "T09:00:00";
    endingTime = currentDate + "T18:01:45";

    var availableSeatByUserURL = baseUrl+ "reservations/findByUser?email=" + username+ "&startingTime="+ startingTime +"&endingTime=" + endingTime;

    var options = {
        url: availableSeatByUserURL,
        method: 'GET',
        headers: headers
    }
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log("LIST!",JSON.parse(body));
            var seatList = JSON.parse(body);
            var deleteReservationURL = "";
            var options_delete = {
                url: deleteReservationURL,
                method: 'DELETE',
                headers: headers
            }
            if(seatList.length == 0){
                message = "We cannot find your reservation for "+ date + ". Please make sure and try again. ";
                resolve();
            }
            else {
                    deleteReservationURL = baseUrl+ "reservations/" +  seatList[0].id;
                    var options_delete = {
                        url: deleteReservationURL,
                        method: 'DELETE',
                        headers: headers
                    };
                    request(options_delete, function (error, response, body) {
                        if (!error && (response.statusCode == 200 ||response.statusCode == 204)) {
                            message = "Your reservation for " + date + " has been successfully deleted.";
                            resolve();

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
            "name": "cancel_reservation",
            "properties": {
              "date": { "type": "string", "required": true },
              "username": { "type": "string", "required": true }
            },
            "supportedActions": []
        }
    ),

    invoke: (conversation, done) => {

      const nlpvalue = conversation.properties().date;

      var regResult = nlpvalue.match(new RegExp("date=[0-9]*"));
      if(regResult== null){
        conversation.reply({ text: "Please input valid date."});
        conversation.keepTurn(false);
        conversation.transition();
        done();
        return;
      }
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

      var gettingDate = (regResult[0]).split('=')[1];
      var utcSeconds = gettingDate.substring(0, gettingDate.length -3);
      var date = new Date(0); // The 0 there is the key, which sets the date to the epoch
      date.setUTCSeconds(utcSeconds);
      date = (JSON.stringify(date).split('T')[0]).substring(1, date.length);

        console.log(conversation.properties());
        var TextFromUser = conversation.request().message.payload.message.text;
        console.log("TextFromUser- canceling",TextFromUser);

        message_generation(date, username).then(
            function(){
                //resolve;
                console.log("this is cool");
              //  conversation.reply({ text: 'date :' + date + ', username :' + username});
                conversation.reply({ text: message});
                conversation.transition();
                done();
            },
            function(){
                //reject;

            });


    }
};
