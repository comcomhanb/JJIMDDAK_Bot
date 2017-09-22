"use strict";

var log4js = require('log4js');
var request = require('request');
var logger = log4js.getLogger();
var headers = {
  'Content-Type' : 'application/json',
  'Accept' : 'application/json',
  'Authorization' : 'Basic c3VuZy5oeWUuamVvbkBvcmFjbGUuY29tOndlbGNvbWUx'
}
var availableSeatUser;
var baseUrl = "http://129.150.84.190:8080/v1/";

function message_generation(username) {
  return new Promise(function (resolve, reject) {


    var availableSeatByUserURL = baseUrl+ "reservations/findByUser?email=" + username;

    var options = {
        url: availableSeatByUserURL,
        method: 'GET',
        headers: headers
    }
    console.log("availableSeatURL", availableSeatByUserURL);
    request(options, function (error, response, body) {
      console.log("error",error);

        console.log("response.statusCode", response.statusCode);

        if (!error && response.statusCode == 200) {
          var seatList = JSON.parse(body);

          if(seatList.length == 0){

              availableSeatList = "We did find your reservation history on our record."
              resolve();
          }

            console.log("this is working",body);
            var availableSeatList = "";
            for(var i =0; i < seatList.length; i++ ){
                availableSeatList += "DATE : " + seatList[i].startingTime.split('T')[0] + "/ SEAT : " + seatList[i].seat.seatNo + ", ";
            }
            availableSeatUser = availableSeatList;
            resolve();
        }
    })

    });

}


module.exports = {

        metadata: () => (
        {
            "name": "check_history",
            "properties": {
              "username": { "type": "string", "required": true }
            },
            "supportedActions": []
        }
    ),

    invoke: (conversation, done) => {
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

        console.log(conversation.properties());
        var TextFromUser = conversation.request().message.payload.message.text;
        console.log("TextFromUser- canceling",TextFromUser);

        message_generation(username).then(
            function(){
                //resolve;
                console.log("this is cool");
                conversation.reply({ text: availableSeatUser});
                conversation.transition();
                done();
            },
            function(){
                //reject;

            });


    }
};
