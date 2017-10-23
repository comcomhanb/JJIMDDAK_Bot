"use strict"
var dbpool = require('../util/dbpool.js');
var log4js = require('log4js');
var logger = log4js.getLogger();
var serverResponse = '';
var intent_id_from_db;
var request = require('request');
var response;
var intent;



function message_generation(intent) {
    return new Promise(function (resolve, reject) {
        dbpool.getPool().getConnection(function (err, connection) {

        var query = connection.query(
            "select * from intent left outer join text on intent.component_id = text.text_id left outer join image on intent.component_id = image.image_id where intent.intent_name = ? ",intent,
            function (err, data) {
                connection.release();
            if (err) {
                reject();
                console.log("err", err);
                throw err;
            }
        response = data;
        resolve();
        });
    });
});
}

function keyword_search(userInput){
    return new Promise(function(resolve, reject){

        //TODO : keyword search  
        var output;
        var intentList = [
        {
            "intent": "snack",
            "keywords": ['snack', '간식']
        }
        ]

        var results = [];
          for(var j = 0; j < intentList.length; j++) {
            for(var i = 0; i < intentList[j].keywords.length ; i++) {
              results = userInput.match(new RegExp( (intentList[j].keywords).join("|"), "g")) ;
              if (results != null){
                intent = intentList[j].intent;
                break;
              }
            }
        }
        if(results == null) intent = "sorry"; 
        console.log(">>>>>>>>>", intent);
        resolve();      

    });
}

module.exports = {

    metadata: () => ({
        "name": "response_in_fb_layout",
        "properties": {
        },
        "supportedActions": [
        ]
    }),

    invoke: (conversation, done) => {
        var generic_array = [];

        var userInput = conversation.request().message.payload.text;
   

         keyword_search(userInput).then(
             function(){
                message_generation(intent).then(
                    function () {
                    for (var i = 0; i < response.length; i++) {
                        switch (response[i].layout_type) {
                        case 'text':
                            conversation.reply(response[i].text_title);
                            break;
                        case 'image':
                            conversation.reply({
                                    "attachment":
                                    {
                                        "type": "image",
                                        "payload": {
                                            "url": response[i].image_url
                                        }
                                    }
                                }
                         );
                         break;
                    }
                }

                conversation.transition();
                done();

            },
            function () {
                console.log("you failed ");
                conversation.transition();
                done();
            }
        );
             }, function(){
                console.log("you failed ");
                conversation.transition();
                done();
             }
         );








    }
};
