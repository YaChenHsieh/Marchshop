const router = require("express").Router();
const mysql = require("mysql");
const moment = require("moment");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "foodcart"
});

db.connect((error) => {
    if (error) { throw error; }
    console.log("member db connected!!")
})

//router使用
router.use((req, res, next) => {
    if (!req.session.loginUser) {
        res.redirect("/login");


    }//if end
    else {
        //console.log("are in member.js2!")
        //console.log(req.session.loginUser)
        next()
    }


    //log into member
    router.get("/", (req, res) => {
        //console.log("MEMBER in req.session")
        //console.log(req.session)
        res.render("member.hbs", { member: req.session })

    })

    //customer info (member)
    router.get("/member_edit", (req, res) => {
        db.query("SELECT * FROM cus_list where c_id=?", [req.session.loginUser.c_id], (error, results, fields) => {
            if (!results.length) {
                res.status(404);
                res.send("No Data!");
            }
            else if (results.length) {
                //console.log("results[0]")
                //console.log(results[0])
                const member = results[0]
                res.render("customer_mbr_edit.hbs", { member: member });
            };

        })//db.query end
        //console.log("CUSTOMER in req.session")
        //console.log(req.session)
    })


    //前端丟資料來了！
    router.post("/member_edit", (req, res) => {

        let my_result =
        {
            success: false,    //先給false，因為一開始還沒新增成功
            affectedRows: 0,    //因為尚未新增，所以為零
            info: "每個欄位都必需要填"
        };
        //console.log("req.body============if只有req會超級無敵長")
        //console.log(req.body)

        //此時req.body.name的name是跟後端的name一致，並不是跟db裡的資料 (ajas post 過來的)
        if (!req.body.name || !req.body.email || !req.body.password || !req.body.phone) {
            res.json(my_result);
            return;
        }

        //設定電話號碼不可以重複！
    db.query("SELECT * FROM cus_list WHERE Phone=? AND c_id<>? ", //此處兩個問號，對應下方res.body,req.params
    [req.body.phone, req.body.c_id], //上方?對應到路由的c_id, 下方req.params對應資料庫裡面的c_id
    (error, results, fields) => {
        if (results.length) {
            res.json({
                success: false,    //先給false，因為一開始還沒新增成功
                info: "電話號碼重複"
            }); return;
        }//if 有電話重複
        else { console.log("phone沒有重複")
            db.query("SELECT * FROM cus_list WHERE Email=? AND c_id<>?",
                [req.body.email, req.body.c_id], (error, results, fields) => {
                    if (results.length) {console.log("email重複")
                        res.json({
                            success: false,    //先給false，因為一開始還沒新增成功
                            info: "信箱重複"
                        });
                        return;
                    }//if 有信箱重複
                    else {
                        console.log("email & phone 沒有重複")
                        
                        //如果上方篩點條件都過，則到下方
                        db.query(" UPDATE cus_list SET Name=?,Email=?,Password=?,Phone= ? WHERE c_id = ?",
                            [req.body.name, req.body.email, req.body.password, req.body.phone, req.body.c_id],
                            (error, results, fields) => {

                                console.log(req.body)
                                console.log(results);
                                console.log("ok");
                                if (error) { console.log(error.sqlMessage); res.json(error.sqlMessage); }
                                if (results.changedRows == true) { my_result = { success: true, affectedRows: 1, info: "修改成功" }; res.json(my_result); }
                                else if (results.changedRows === 0) { my_result["info"] = "資料沒修改"; res.json(my_result); }

                            }

                        )//db.query for update

                    }

                })//db.query for email

        }

    });//db.query for phone

    });//app.post





    //shoplist (member)
    router.get("/shoplist", (request, response) => {
        console.log("shoplist request.session")
        console.log(request.session)
        console.log("=================loginUser")
        console.log(request.session.loginUser)
        if (request.session.loginUser) {
            console.log("request.session.loginUser inside if")
            console.log(request.session.loginUser)
            db.query("SELECT * from ord_items where c_id=?", [request.session.loginUser.c_id], (error, results, fields) => {
                if (error) {
                    throw error;
                } else if (results.length) {
                    console.log("results from db shoplist")
                    console.log(results)

                    response.render("shoplist", { purchase: results, member: request.session })
                }

            })//db.query end

        } else {
            response.render("login");
        }

    });










})//router.use((req,res,next)) end

module.exports = router;
