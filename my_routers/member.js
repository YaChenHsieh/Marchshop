const router = require("express").Router();
const mysql = require("mysql");
const moment = require("moment");


const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "foodcart",
    dateStrings: "false" //將sql回傳的時間格式，強制轉為YYYY-MM-DD hh:mm:ss
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
}); //router.use((req,res,next)) end




//log into member
router.get("/", (req, res) => {
    //console.log("MEMBER in req.session")
    //console.log(req.session)
    res.render("member.hbs", { member: req.session,  })

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
            const member_info = results[0]
            res.render("customer_mbr_edit.hbs", { m_info: member_info, member: req.session,  });
        };

    })//db.query end
    //console.log("CUSTOMER in req.session")
    //console.log(req.session)
})


//前端丟資料來了！
router.post("/member_edit", (req, res) => {
    // console.log("前端丟資料！");
    // console.log(req.body);
    let my_result =
    {
        success: false,    //先給false，因為一開始還沒新增成功
        affectedRows: 0,    //因為尚未新增，所以為零
        info: "每個欄位都必需要填",
      

    };
    //console.log("req.body============if只有req會超級無敵長")
    //console.log(req.body)

    //此時req.body.name的name是跟後端的name一致，並不是跟db裡的資料 (ajas post 過來的)
    if (!req.body.name || !req.body.email || !req.body.password) {
        res.json(my_result);
        return;
    }

    //設定信箱不可以重複！
    db.query("SELECT * FROM cus_list WHERE Email=? AND c_id<>?",
        [req.body.email, req.body.c_id], (error, results, fields) => {
            if (results.length) {
                //console.log("email重複")
                res.json({
                    success: false,    //先給false，因為一開始還沒新增成功
                    info: "信箱重複",
                    
                });
                return;
            }//if 有信箱重複
            else {
                //console.log("email沒有重複")

                //如果上方篩點條件都過，則到下方
                db.query(" UPDATE cus_list SET Name=?,Email=?,Password=?,Phone=? WHERE c_id = ?",
                    [req.body.name, req.body.email, req.body.password, req.session.loginUser.Phone, req.body.c_id],
                    (error, results, fields) => {

                        // console.log(req.body)
                        // console.log(results);
                        // console.log("前端PHONE！")
                        // console.log(req.session.loginUser.Phone)
                        // console.log("ok");

                        if (error) { console.log(error.sqlMessage); res.json(error.sqlMessage); }
                        if (results.changedRows == true) { my_result = { success: true, affectedRows: 1, info: "修改成功" }; res.json(my_result); }
                        else if (results.changedRows === 0) { my_result["info"] = "資料沒修改"; res.json(my_result); }

                    }

                )//db.query for update

            }//else ned

        })//db.query for email

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
        console.log(request.session.loginUser.c_id)
        const qq="Select i.o_id , i.P_name , i.Qty , i.Price, i.P_Time, i.c_id, l.Total_Price from ord_items i right join ord_list l  on i.o_id=l.o_id where i.c_id=?"
        db.query(qq, [request.session.loginUser.c_id], (error, results, fields) => {
            if (error) {
                throw error;
            } else {
                console.log("results from db shoplist")
                console.log(results)
                //console.log(results[0])

                
                for (let i = 0; i < results.length; i++) {
                    console.log(`第${i}個`)
                    console.log(results[i])
                //    var obj={}
                //    obj.oid=results[i].o_id
                //    obj.cid=results[i].c_id
                //    obj.prod=results[i].P_name
                //    obj.qty=results[i].Qty
                //    obj.price=results[i].Price
                //    obj.ptime=results[i].P_Time
                //    console.log(obj)
                }
                
                //console.log(results[0].timeformat)//DB出來要格式化時間：直接在db宣告時給予dateStrings: "false"=>會強迫轉值
                response.render("shoplist", { purchase: results, member: request.session,})
            }

        })//db.query end

    } else {
        response.redirect("/login");
    }

});




module.exports = router;
