"use strict";
const configGet = require("config")
const request = require("request");
const line = require("@line/bot-sdk");
const config = {
    channelAccessToken: configGet.get("CHANNEL_ACCESS_TOKEN"),
    channelSecret: configGet.get("CHANNEL_SECRET")
};
const client = new line.Client(config);
const lineapp = require("express").Router();

const mysql = require("mysql");
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "foodcart",
    dateStrings: true
})


db.connect((error) => {
    if (error) {
        throw error
    }
    else {
        console.log("line DB connected");
    }
})//db.connect end




//Line query
lineapp.post("/", line.middleware(config), function (req, res) {
    console.log("In or Not");
    let data = req.body.events;
    console.log(data);//使用者回傳的text在陣列裡
    //console.log(data[0].message.type)

    if (data[0].type === "message" && data[0].message.type === "text") {
        const test01 = {
            "type": "template",
            "altText": "Check out our items",
            "template": {
                "type": "buttons",
                "thumbnailImageUrl": "https://png.pngtree.com/element_origin_min_pic/16/11/07/bece203ed79990c886f026b17dfd4099.jpg",
                "imageAspectRatio": "rectangle",
                "imageSize": "cover",
                "imageBackgroundColor": "#FFFFFF",
                "title": "Check out our new item",
                "text": "Press the button to check out our items",
                "defaultAction": {
                    "type": "uri",
                    "label": "View detail",
                    "uri": "https://cdn.shopify.com/s/files/1/1511/0050/products/Coke_1024x1024.png?v=1528134174"
                },
                "actions": [
                    {
                        "type": "postback",
                        "label": "See Products",
                        "data": "check items"
                    },
                ]
            }
        }//test01 end
        return client.replyMessage(data[0].replyToken, test01)
    }//if(==="type") end
    else {
        console.log("ITS POSTBACK")
        if (data[0].postback.data == "check items") {
            //console.log("into check items")
            console.log(data[0].postback.data)


            db.query("select * from pro_list", (error, results, fields) => {
                console.log(results)
                var corl =
                {
                    "type": "template",
                    "altText": "this is a carousel template",
                    "template": {
                        "type": "carousel",
                        "columns": [],
                        "imageAspectRatio": "rectangle",
                        "imageSize": "cover"
                    }
                }
                var linecolumns = corl.template.columns
                console.log('columns')
                console.log(linecolumns)

                for (let i = 0; i < results.length; i++) {
                    console.log(`第${i}個`)
                    //console.log(results[i])
                    let prod = results[i].P_name;
                    let price = results[i].Price;
                    let pic = results[i].Pic;
                    console.log(prod)
                    console.log(price)
                    console.log(pic)

                    var corlobj={
                        "thumbnailImageUrl": "https://example.com/bot/images/item1.jpg",
                        "imageBackgroundColor": "#FFFFFF",
                        "title": `${prod}`,
                        "text": `$ ${price}`,
                        "defaultAction": {
                            "type": "uri",
                            "label": "View detail",
                            "uri": "http://example.com/page/123"
                        },
                        "actions": [
                            
                            {
                                "type": "uri",
                                "label": "View detail",
                                "uri": "http://example.com/page/111"
                            }
                        ]
                    }

                    linecolumns.push(corlobj)
                    console.log("linecolumns")
                    console.log(linecolumns)
                }//for end

                return client.replyMessage(data[0].replyToken, corl)

            })//query end

        }//if coke end





    }






    //return client.replyMessage(data[0].replyToken, test01)

    // Promise
    // .all(req.body.events.map(handleEvent))
    // .then((result)=>res.json(result))
    // .catch((error)=>{
    //     console.log(error);
    //     res.status(500).end()
    // })
    //let askprod = data.queryResult.parameters.

})

module.exports = lineapp;
