"use strict"
var dbpool = require('../util/dbpool.js');
var log4js = require('log4js');
var logger = log4js.getLogger();
var serverResponse = '';
var intent_id_from_db;
var request = require('request');
var response;

//| quick_reply_id | quick_reply_title  |   quick_reply_seq | reply_type | reply_title  | reply_payload  |



function message_generation(intent) {

    return new Promise(function (resolve, reject) {

        dbpool.getPool().getConnection(function (err, connection) {

		if(intent == "Intent.None") {

		intent = "none" + JSON.stringify(  Math.floor((Math.random() * 3) +1) ) ;
		console.log(intent);
	}
		console.log("usal : " + intent);
            var query = connection.query(
                "select * from intent left outer join text on intent.component_id = text.text_id left outer join button on intent.component_id = button.button_id left outer join image on intent.component_id = image.image_id left outer join generic on intent.component_id = generic.generic_id left outer join quick_reply on intent.component_id = quick_reply.quick_reply_id where intent.intent_name = ? ",
                intent,
                function (err, data) {
                    connection.release();
                    if (err) {
                        reject();
                        throw err;
                    }
                    // for (var i = 0; i < data.length; i++) {
                    //     var obj = data[i];

                    //     for (var key in obj) {
                    //         if (obj.hasOwnProperty(key)) {
                    //             var val = obj[key];
                    //             if (val == undefined || val == null) delete obj[key];
                    //         }
                    //     }
                    //if(data[i].layout_type == "text ")
                    //when debug mode
                    // console.log("print: : ");
                    // for (var key in obj) {
                    //     if (obj.hasOwnProperty(key)) {
                    //         var val = obj[key];
                    //         console.log(key + " : " + val);
                    //     }
                    // }
                    //  }

                    response = data;
                    //console.log(JSON.stringify(response));
                    resolve();
                });

        });

    });
}

function getElements(dataList) {
    var json = {};
    var _array = [];

    for (var i in dataList) {
        _array.push(makeElement(dataList[i]));

    } //for
    json.template_type = "generic";
    json.elements = _array;
    return json;
}
function getQuickReply(data) {
    var json = {};
    var _array = [];

    for (var i in data) {
        var year = {
            "content_type": "text",
            "title": data[i].reply_title,
            "payload": data[i].reply_payload
        };
        _array.push(year);
    } //for

    json.text = data[0].quick_reply_title;
    json = _array;
    return json;
}


function makeElement(data) {
    var button;

    if (data.generic_b_type == "postback") {
        button = [{
            "type": data.generic_b_type,
            "title": data.generic_b_title,
            "payload": data.generic_b_payload
        }];
    } else if (data.generic_b_type == "web_url") {
        button = [{
            "type": data.generic_b_type,
            "title": data.generic_b_title,
            "url": data.generic_b_url
        }];
    } else {
        console.log(data.generic_b_type);
    }
    var elements = {
        "title": data.generic_title,
        "subtitle": data.generic_subtitle,
        "image_url": data.generic_image_url,
        "buttons": button
    };
    return elements;
}

function getButtons(dataList) {
    var json = {};
    var _array = [];

    for (var i in dataList) {
        console.log("data List : " + JSON.stringify(dataList[i]));
        _array.push(makeButton(dataList[i]));
    } //for

    json.template_type = "button";
    json.text = dataList[0].button_title;
    json.buttons = _array;
    return json;
}

function makeButton(data) {
    var button;
    if (data.b_type == "postback") {
        button = {
            "type": data.b_type,
            "title": data.b_title,
            "payload": data.b_payload
        };
    } else if (data.b_type == "web_url") {
        button = {
            "type": data.b_type,
            "title": data.b_title,
            "url": data.b_url
        };
    } else {
        button = {
            "type": data.b_type,
            "title": data.b_title,
            "url": data.b_url
        };
    }
    return button;
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
      //  var intent = null;
        var intent = "Intent.None";

        var final = {};
        var generic_array = [];
        var button_array = [];
        var quick_array = [];
        var userInput;
        console.log(conversation.request().message.payload);
        if(conversation.request().message.payload.postback != undefined) userInput = conversation.request().message.payload.postback.payload;
        else userInput =  conversation.request().message.payload.message.text;
        var output;
        console.log(">>>>>>userInput<<<<<<<<", userInput);
        var intentList = [
        {
            "intent": "menu",
            "keywords": ['menu', '메뉴', '매뉴', '초기 메뉴', '초기매뉴']
        },
        {
            "intent": "startChat",
            "keywords": ['startChat', '안녕', '방가방가', 'ㅎㅇ', 'hello','hi']
        },
        {
            "intent": "location",
            "keywords": ['location', '장소', '위치']
        },
        {
            "intent": "nearbyHotel",
            "keywords": ['nearbyHotel', '숙소', '숙박', '호텔']
        },
        {
            "intent": "transportation",
            "keywords": ['transportation', '대중 교통', '교통', '가는 법', '어떻게 가', '가는 방법', '오시는']
        },
        {
            "intent": "when",
            "keywords": ['when', '언제', '일시']
        },
        {
            "intent": "homepage",
            "keywords": ['homepage', '홈페이지', '홈패이지', '웹사이트', '웹']
        },
        {
            "intent": "video",
            "keywords": ['video', '홍보 영상', '영상', '관련 영상']
        },                        
        {
            "intent": "heldBy",
            "keywords": ['heldBy', '주최']
        },
        {
            "intent": "support",
            "keywords": ['support', '후원']
        },
        {
            "intent": "contact",
            "keywords": ['contact number','contact', '행사 문의', '행사 연락처', '행사문의', '연락처', '문의']
        },
        {
            "intent": "ContactOracle",
            "keywords": ['ContactOracle','담당 영업', '영업 대표', '영업', '대표', '오라클']
        },  
        {
            "intent": "2016",
            "keywords": ['2016','작년']
        },        
        {
            "intent": "program",
            "keywords": ['program','프로그램', '일정']
        },          
        {
            "intent": "officialEvent",
            "keywords": ['official event', '공식 행사', '공식행사']
        },                        
        {
            "intent": "welcomeReception",
            "keywords": ['welcome reception', '환영 리셉션', '리셉션', '환영리셉션', '웰컴 리셉션']
        },
        {
            "intent": "welcomingEvent",
            "keywords": ['welcome event', '개막식', '개막 행사']
        },
        {
            "intent": "cultureNight",
            "keywords": ['culture night', '문화의 밤', '문화의']
        },
        {
            "intent": "awards",
            "keywords": ['award', '어워즈', '시상식', '시상']
        },
        {
            "intent": "technicalTour",
            "keywords": ['technical tour', '테크니컬 투어', '투어']
        },
        {
            "intent": "careerFair",
            "keywords": ['career fair', '취업 박람회', '취업', "채용"]
        },
        {
            "intent": "majorEvent",
            "keywords": ['주요 행사', '주요 일정', '주요']
        },
        {
            "intent": "techFair",
            "keywords": ['techFair', '신기술 전시회', '신기술', '전시회']
        },
        {
            "intent": "ESS",
            "keywords": ['주요 행사', '주요 일정', '주요']
        },
        {
            "intent": "techFairFee",
            "keywords": ['techFairFee', '전시회 입장료', '전시회 얼마', '전시회 참가료']
        },
        {
            "intent": "techFairCompany",
            "keywords": ['techFairCompany', '전시회 참가 기업', '참가 기업', '기업']
        },
        {
            "intent": "chatbot",
            "keywords": ['chatbot', '챗봇', '봇', '쳇봇']
        },
        {
            "intent": "oracle",
            "keywords": ['Oracle', 'oracle', '오라클']
        },
        {
            "intent": "oracleTopic",
            "keywords": ['oracleTopic', '오라클 전시회 주제', '오라클 전시회']
        }, 
       {
            "intent": "IntelligentBot",
            "keywords": ['Intelligent Bot', 'IntelligentBot', '오라클 챗봇']
        },        
        {
            "intent": "techFairMap",
            "keywords": ['techFairMap', '배치도']
        },    
        {
            "intent": "eventMap",
            "keywords": ['행사장 구성', 'map']
        },            
        {
            "intent": "MAX",
            "keywords": ['MAX', 'max', '맥스']
        },        
        {
            "intent": "techFairCompanyOther",
            "keywords": ['techFairCompanyOther', '다른 참석자']
        },          
        {
            "intent": "patentFair",
            "keywords": ['patentFair', '발명 특허', '발명특허']
        },
        {
            "intent": "patentFairPrereq",
            "keywords": ['patentFairPrereq', '발명 특허 대전 자격', "출품 자격", "출품자격"]
        },
        {
            "intent": "patentFairTopic",
            "keywords": ['발명특허 주제', '출품주제', '출품 주제']
        },
        {
            "intent": "patentFairRegistration",
            "keywords": ['patentFairRegistration', '출품 신청']
        },
        {
            "intent": "internationalCon",
            "keywords": ['internationalCon', '국제 컨퍼런스', '국제컨퍼런스', '컨퍼런스']
        },
        {
            "intent": "internationalConfTopic",
            "keywords": ['컨퍼런스 주제', 'internationalConfTopic']
        },
        {
            "intent": "bizMeetingReg",
            "keywords": ['비지니스 미팅', 'business meetint', '비지니스미팅']
        },
        {
            "intent": "registration",
            "keywords": ['registration', '참가 신청', '참가']
        },
        {
            "intent": "earlybirdCheck",
            "keywords": ['earlybirdCheck', '사전등록', '사전 등록']
        },
        {
            "intent": "goodRes",
            "keywords": ['goodRes', '근처 맛집', '맛집']
        },
        {
            "intent": "eventDetails",
            "keywords": ['행사 개요', '정보']
        }                           
              


        
        //15

        ]

          var results = [];
          for(var j = 0; j < intentList.length; j++) {
            console.log("intentList.length " + intentList.length);
          //  console.log("intentList[i].keywords.length " + intentList[i].keywords.length);

            for(var i = 0; i < intentList[j].keywords.length ; i++) {
              results = userInput.match(new RegExp( (intentList[j].keywords).join("|"), "g")) ;
              if (results != null){
                intent = intentList[j].intent;
                break;
              }
            }
        }




        //intent = conversation.request().message.componentResponse.action;

        message_generation(intent).then(
            function () {

                console.log("response : " + response);

                for (var i = 0; i < response.length; i++) {
                    switch (response[i].layout_type) {
                        case 'text':
                            // conversation.reply(response[i].text_title);
                            conversation.reply(response[i].text_title);
                            break;
                        case 'image':
                            // conversation.reply(response[i].image_url);
                            conversation.reply(
                                final = {
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
                        case 'gen':
                            console.log("this is generic");
                            generic_array.push(response[i]);
                            break;
                        case 'quick':
                            quick_array.push(response[i]);
                            console.log("this is quick_reply");
                            break;
                        case 'button':
                            button_array.push(response[i]);
                            console.log("this is button");
                            break;
                    }
                }
                if (generic_array.length != 0) {
                    console.log("this is generic_array array");

                    final = {
                        "attachment":
                        {
                            "type": "template",
                            "payload": getElements(generic_array)

                        }
                    }
                                    conversation.reply(final)

                }
                if (quick_array.length != 0) {
                    console.log("this is quick_reply array");
                    final = {
                        "text": quick_array[0].quick_reply_title,
                        "quick_replies": getQuickReply(quick_array)
                    }
                conversation.reply(final)

                }
                if (button_array.length != 0) {
                    console.log("this is button array");
                    final = {
                        "attachment":
                        {
                            "type": "template",
                            "payload": getButtons(button_array)
                        }
                    }
                conversation.reply(final)

                }

                conversation.transition();
                done();

            },
            function () {
                console.log("you failed ");
                conversation.transition();
                done();

            }


//                 console.log("final", final)
//                 conversation.reply("final");
// //                conversation.reply(final);

//                 conversation.transition();
//                 done();

//             },
//             function () {
//                 console.log("you failed ");
//                 conversation.transition();
//                 done();

//             }
        );






    }
};
