"use strict";

var log4js = require('log4js');
var logger = log4js.getLogger();
var count = 0;
module.exports = {

    metadata: () => (
        {
            "name": "say_hello",
            "properties": {
                "flag": { "type": "string", "required": true }
            },
            "supportedActions": []
        }
    ),

    invoke: (conversation, done) => {
        switch (count) {
            case 0:
                var final =
                    {
                        "attachment": {
                            "type": "template",
                            "payload": {
                                "template_type": "generic",
                                "elements": [
                                    {
                                        "title": "범죄도시",
                                        "image_url": "http://img.tenasia.hankyung.com/webwp_kr/wp-content/uploads/2017/09/2017090106182218493-540x387.jpg",
                                        "subtitle": "통쾌하고! 화끈하고! 살벌하게! 나쁜 놈들 때려잡는 강력반 형사들의 ‘조폭소탕작전’이 시작된다!",
                                        "buttons": [
                                            {
                                                "type": "postback",
                                                "title": "자세히 보기",
                                                "payload": "DEVELOPER_DEFINED_PAYLOAD"
                                            }
                                        ]
                                    },
                                    {
                                        "title": "남한산성",
                                        "image_url": "https://i.ytimg.com/vi/bjV8pfOTl1E/hqdefault.jpg",
                                        "subtitle": " 나아갈 곳도 물러설 곳도 없는 고립무원의 남한산성, 나라의 운명이 그곳에 갇혔다!",

                                        "buttons": [
                                            {
                                                "type": "postback",
                                                "title": "자세히 보기",
                                                "payload": "DEVELOPER_DEFINED_PAYLOAD"
                                            }
                                        ]
                                    },
                                    {
                                        "title": "킹스맨 : 시크릿 에어전트",
                                        "image_url": "http://img.insight.co.kr/static/2017/09/19/700/006k1u35veiz14u1c9z9.jpg",
                                        "subtitle": " 전 세계를 장악하기 위해 위협적인 비지니스를 추진 중인 골든 서클의 계획을 막기 위한 킹스맨과 스테이츠맨의 작전이 시작된다.",

                                        "buttons": [
                                            {
                                                "type": "postback",
                                                "title": "자세히 보기",
                                                "payload": "DEVELOPER_DEFINED_PAYLOAD"
                                            }
                                        ]
                                    },
                                    {
                                        "title": "희생부활자",
                                        "image_url": "https://i.ytimg.com/vi/LUqRgURh4fc/maxresdefault.jpg",
                                      "subtitle": "진홍은 스스로 7년전 엄마의 죽음에 얽힌 진실을 밝혀내려 하는데…",

                                        "buttons": [
                                            {
                                                "type": "postback",
                                                "title": "자세히 보기",
                                                "payload": "DEVELOPER_DEFINED_PAYLOAD"
                                            }
                                        ]
                                    }
                                ]

                            }
                        }
                    }
                conversation.reply(final);
                conversation.transition(false);
                count = 1;
                done();
                break;
            case 1:
                var final =
                    {
                        "text": "등록되어있는 선호 영화관(매가박스 삼성)으로 예약할까요?",
                        "quick_replies": [
                            {
                                "content_type": "text",
                                "title": "Yes",
                                "payload": "YES"                            },
                            {
                                "content_type": "text",
                                "title": "No",
                                "payload": "NO"
                            }                            
                        ]
                    }
                conversation.reply(final);
                conversation.transition(false);
                count = 2;
                done();
                break;
            case 2:
                var final =
                    {
                        "text": "결제 수단을 선택해 주세요.",
                        "quick_replies": [
                            {
                                "content_type": "text",
                                "title": "포인트 결제",
                                "payload": "YES"                            
                            },{
                                "content_type": "text",
                                "title": "휴대폰소액결제",
                                "payload": "NO"
                            },{
                                "content_type": "text",
                                "title": "신용카드",
                                "payload": "NO"
                            },{
                                "content_type": "text",
                                "title": "기타",
                                "payload": "NO"
                            }                             
                        ]
                    }
                conversation.reply(final);
                conversation.transition(false);
                count = 3;
                done();
                break;
            case 3:

                conversation.reply({ "text": "좌석은 임의 배정입니다."});
                conversation.reply({ "text": "성인 2명 (금액 : 20,000원) 포인트로 결제되었습니다."});
                conversation.reply({ "text": "예매확인 문자메시지로 발송되었습니다."});
                
                conversation.transition();
                count = 0;
                done();
                break;                                 
        }
    }

};
