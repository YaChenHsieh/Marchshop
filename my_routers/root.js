const addprod = require("express").Router();
const express = require("express");
const mysql = require("mysql");
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "foodcart"
})


db.connect((error) => {
    if (error) {
        throw error
    }
    else {
        console.log("additem DB connected");
    }
})//db.connect end

addprod.use((req, res, next) => {
    console.log("req.session.loginUser=========================")
    console.log(req.session.loginUser)
    if (!req.session.loginUser) {
        res.redirect("/login");
    }
    if (req.session.loginUser.Name != "root") {
        console.log("不是root")
        console.log(req.session.loginUser.Name)
        //res.redirect("/member")
        res.json({info:"您無權訪問", rootTF:false, type:"danger"})
        return;

    }
    else {
        console.log("req.session.loginUser.Email===================")
        console.log(req.session.loginUser.Email)
        console.log(req.session.loginUser.Name)
        next()
    }
    console.log("又進來")
    addprod.get("/", (req, res) => {
        console.log("in root/")
        res.redirect("/root")
    })


    //step 1. 讀取資料 =============================
    addprod.get("/customer", (request, response) => {
        db.query("select * from cus_list", (error, results, fields) => { //results是資料庫query後丟出來的資料
            // console.log(results);   //測試資料庫寫入資料為何
            // response.send("ok");   //測試資料庫寫入與否寫入=> 可看出資料回傳的值事多少

            response.render("customer.hbs", { customer: results, member: request.session  }) //edit BD format first==> go customer.hbs add{{# sales}}
            // console.log(results)
        });
    });


    //step 3. 刪除 java delete =============================
    addprod.get("/customer/delete/:c_id", (req, res) => {
        //  res.render("customer.hbs"); //不需要如此，因為在customer.hbs按了刪除後，直接往customer.hbs 下方的<script>做動作，之後在get路徑"/customer/delete/:c_id"，並且db.query

        db.query("DELETE FROM cus_list WHERE c_id =?", [req.params.c_id], (error, results, fields) => {
            res.redirect("/customer");

        });
    });

    //step 3. 刪除 ajax delete
    addprod.get("/customer/delete2/:c_id", (req, res) => {

        db.query("DELETE FROM cus_list WHERE c_id=?", [req.params.c_id], (error, results, fields) => {
            //    console.log(results)
            res.json("results");
            res.json(results);
        });//db.query end
    }) //app.get end

    //step 4. 修改 edit  ============================================
    addprod.get("/customer/edit/:c_id", (req, res) => {

        db.query("SELECT * FROM cus_list WHERE c_id=?", [req.params.c_id], (error, results, fields) => {
            //   console.log(results); //回傳陣列
            //   console.log(results[0]) //回傳物件

            if (!results.length) { res.status(404); res.send("No Data!"); }
            else { res.render("customer_edit.hbs", { item: results[0] }); };
        });//dbquery end
    })//app.get

    //前端丟資料來了！
    addprod.post("/customer/edit/:c_id", (req, res) => {

        let my_result =
        {
            success: false,    //先給false，因為一開始還沒新增成功
            affectedRows: 0,    //因為尚未新增，所以為零
            info: "每個欄位都必需要填"
        };
        // console.log(res)

        //此時req.body.name的name是跟後端的name一致，並不是跟db裡的資料
        if (!req.body.name || !req.body.email || !req.body.password || !req.body.phone) { res.json(my_result); return; }

        //設定電話號碼不可以重複！
        db.query("SELECT * FROM cus_list WHERE Phone=? AND c_id<>? ", //此處兩個問號，對應下方res.body,req.params
            [req.body.phone, req.params.c_id], //上方?對應到路由的c_id, 下方req.params對應資料庫裡面的c_id
            (error, results, fields) => {
                if (results.length) {
                    res.json({
                        success: false,    //先給false，因為一開始還沒新增成功
                        info: "電話號碼重複"
                    }); return;
                }//if 有電話重複
                else {
                    db.query("SELECT * FROM cus_list WHERE Email=? AND c_id<>?",
                        [req.body.email, req.body.c_id], (error, results, fields) => {
                            if (results.length) {
                                console.log("email重複")
                                res.json({
                                    success: false,    //先給false，因為一開始還沒新增成功
                                    info: "信箱重複"
                                });
                                return;
                            }//if 有信箱重複
                            else {

                                //如果上方篩點條件都過，則到下方
                                db.query(" UPDATE cus_list SET Name=?,Email=?,Password=?,Phone= ? WHERE c_id = ?",
                                    [req.body.name, req.body.email, req.body.password, req.body.phone, req.params.c_id],
                                    (error, results, fields) => {
                                        console.log(results);
                                        console.log("ok");
                                        if (error) { console.log(error.sqlMessage); res.json(error.sqlMessage); }
                                        if (results.changedRows == true){ 
                                            my_result = { success: true, affectedRows: 1, info: "修改成功" }; 
                                            res.json(my_result); }
                                        else if (results.changedRows === 0) { my_result["info"] = "資料沒修改"; res.json(my_result); }

                                    }

                                )//db.query for update

                            }

                        })//db.query for email

                }

            });//db.query for phone

    });//app.post




})//addprod end 

module.exports = addprod