"use strict";
const configGet  = require("config")
const request = require("request");
const line = require("@line/bot-sdk");
const config ={
    channelAccessToken:configGet.get("CHANNEL_ACCESS_TOKEN"),
    channelSecret:configGet.get("CHANNEL_SECRET")
};
const client = new line.Client(config);
const lineapp = require("express").Router();


//Line query
lineapp.post("/",line.middleware(config), function(req,res){
    console.log("In or Not");
    let data = req.body.events;
    console.log(data);

     const test01 = {
        "type": "template",
        "altText": "This is a buttons template",
        "template": {
            "type": "buttons",
            "thumbnailImageUrl": "https://example.com/bot/images/image.jpg",
            "imageAspectRatio": "rectangle",
            "imageSize": "cover",
            "imageBackgroundColor": "#FFFFFF",
            "title": "Menu",
            "text": "Please select",
            "defaultAction": {
                "type": "uri",
                "label": "View detail",
                "uri": "http://example.com/page/123"
            },
            "actions": [
                {
                  "type": "postback",
                  "label": "Buy",
                  "data": "action=buy&itemid=123"
                },
                {
                  "type": "postback",
                  "label": "Add to cart",
                  "data": "action=add&itemid=123"
                },
                {
                  "type": "uri",
                  "label": "View detail",
                  "uri": "http://example.com/page/123"
                }
            ]
        }
      }
      
    

    return client.replyMessage(data[0].replyToken, test01)

    // Promise
    // .all(req.body.events.map(handleEvent))
    // .then((result)=>res.json(result))
    // .catch((error)=>{
    //     console.log(error);
    //     res.status(500).end()
    // })
    //let askprod = data.queryResult.parameters.
    
    })

    module.exports = lineapp ;
    