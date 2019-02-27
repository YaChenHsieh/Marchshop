const express = require('express');
const exphbs = require('express-handlebars');
const app = express();

// 宣告URL //
const url = require('url');

// 宣告bodyParser for post method//
const bodyParser = require('body-parser');
// bodyParser 有兩個功能，此處直接app.use變全癒使用// 
app.use(bodyParser.urlencoded({ extended: false })); //false:use 內建querystringlib ; if true:use QS lib//
app.use(bodyParser.json());


//宣告 multer upload使用//
const multer = require('multer');
const upload = multer({ dest: 'tmp_uploads/' });
const fs = require('fs');

//路由器1=========================================
const admin1 = require("./my_routers/admin1");

//路由器2
const admin2 = require("./my_routers/admin2");

//路由器3
const admin3 = require("./my_routers/admin3");

//=========================================
//DB設定
const mysql = require("mysql");
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "foodcart"
});
db.connect(function (err) {
    if (err) throw err;
    console.log("Db connected!");
}); //測試連線
//========================================================引擎設定
app.engine('hbs', exphbs({
    defaultLayout: "main",
    extname: ".hbs",
    helpers: { list: require('./helpers/list.js') }
}));

app.set('view engine', 'hbs');
app.use(express.static('public'));
//=====================================
//使用Session(cookie)設定

const session = require("express-session");

//timezone宣告
const moment = require("moment-timezone");

app.use(session({
    saveUninitialized: false,
    resave: false,
    secret: "secret",
    cookie: { maxAge: 60 * 60 * 1000, }
}));


//宣告使用 app.use(member.js)
app.use("/member", require("./my_routers/member.js"));

//loginUser 的  middleware 建立==================================
app.use((request, response, next) => {
    response.locals.cdata = {
        loginUser: request.session.loginUser
    };
    next();
});
//====================================
//login設定
app.get("/login", (request, response) => {
    response.render("login.hbs");
});

app.post("/login", (request, response) => {
    console.log("測試登入的密碼與帳號request.body")
    console.log(request.body.phone)
    const FlyMsg = {
        loginTF: true,
        type: "danger",
        msg: "帳號或密碼錯誤！",
        //layout: false ===>layout設定false會讓版面的navbar失效
    }
    db.query("SELECT * FROM cus_list where Phone=? AND Password=?", [request.body.phone, request.body.password], (error, results, fields) => {
        console.log("Phone & Password 登入的密碼與帳號");
        console.log(results);
        if (!results.length) {
            console.log("進去if")
            response.render("login.hbs", FlyMsg)

        } else {
            console.log("進去else")
            request.session.loginUser = results[0]
            request.session.FlyMsg = FlyMsg
            FlyMsg.type = "success";
            FlyMsg.msg = "登入成功"
            console.log("request.session.loginUser in else")
            console.log(request.session.loginUser)

            const time = moment().format("YYYY-MM-DD HH:MM:SS")
            console.log("check time")
            request.session.logintime = time
            console.log(time)
            const data = request.session
            console.log("data===========")
            console.log(data)
            response.redirect("/member")

        }
        //console.log("request.session.loginUser")
        //console.log(request.session.loginUser)測試如果在else儲存req.sesstion是否痊癒可用
        console.log(request.session.FlyMsg)
        console.log(request.session.logintime)

    });
})

app.get('/logout', (request, response) => {
    delete request.session.loginUser;
    delete request.session.logintime;
    delete request.session.FlyMsg;
    console.log("=================logout===============")
    console.log(request.session)
    response.redirect('/login');

});

//==========================================

app.get('/', (req, res) => {
    res.render('homepage.hbs', { name: ' Welcome to FoodCart' });
});


// ( '/student' 是給網頁連結的)
app.get('/student', function (request, response) {
    const data = response.locals.cdata; //上方middleware宣告的request.locals.renderData
    const studentinfo = require('./data/info.json');

    data.info = studentinfo;  //data 加入 info(屬性) = studentinfo(值)
    data.myclass = "bg-warning" //data 加入 myclass(屬性) = bg-warning(值)


    response.render('student.hbs', data);
});

app.get('/studentlist', function (request, response) {
    const data = response.locals.cdata;
    const studentinfo = require('./data/info.json');

    data.info = studentinfo;
    data.myclass = "bg-warning"


    response.render('studentlist.hbs', data);
});


app.get('/abc', (req, res) => {
    res.send('<h2>ABC</h2>');
});

// url
app.get('/try-querystring', (request, response) => {
    const urlParts = url.parse(request.url, true);
    response.render('try-querystring.hbs', { urlParts: urlParts });
})

//測試 bodyParser.json功能//
app.post("/try-post2", (request, response) => {
    response.json(request.body);
})


// 製作上傳檔案 //
app.get('/try-upload', (request, response) => {
    const data = response.locals.renderData;

    response.render('try-upload', data);
});
app.post('/try-upload', upload.single('avatar'), (request, response) => {
    console.log('avatar')
    if (request.file && request.file.originalname) {
        if (/\.(jpg||jpeg||png)$/i.test(request.file.originalname)) {
            fs.createReadStream(request.file.path)
                .pipe(
                    fs.createWriteStream('./public/img/' + request.file.originalname)
                );
        }
    }
    response.render('try-upload', {
        result: true, name: request.body.name, avatar: '/img/' + request.file.originalname
    });
});
//使用路由 admin1=================================
admin1(app);

//使用路由 admin2
app.use(admin2);

//使用路由 admin3
app.use("/admin3_baseurl", admin3);
//===================================================
//使用Session

app.get("/try-session", (request, response) => {
    request.session.views = request.session.views || 0;
    request.session.views++;
    response.send(request.session.views.toString());
});
//===================================================
//timezone設定
app.get("/try-moment", (request, response) => {

    response.contentType("text/plain");
    const myFormat = 'YYYY-MM-DD HH:mm:ss';

    const mo1 = moment(); //current time
    const mo2 = moment(request.session.cookie.expires);  //expired time

    response.write("current time : " + mo1.format(myFormat) + "\n");
    response.write("expire time : " + mo2.format(myFormat) + "\n");

    response.write("London time : " + mo2.tz("Europe/London").format(myFormat) + "\n");
    response.write("NYC time : " + mo2.tz("America/New_York").format(myFormat) + "\n");
    response.write("LA time : " + mo2.tz("America/Los_Angeles").format(myFormat) + "\n");


    response.end();//記得寫end,否則他會一直不結束
});
//=============================================20190123
//Create Shopcart
app.get("/shop", (req, res) => {

    db.query("SELECT * FROM pro_list", (error, results, fields) => {
        console.log("into shopitem db");
        console.log(results);
        res.render("shop.hbs", { shopitems: results })

    });//db.queryend


})//app.get & (req,res) end

app.post('/qqq', (req, res) => { //前端的請求，丟在req=我可以選擇是否去用 ; res回應給前端
    console.log("後端收到得直,total,item, price, Q")
    console.log(req.body);

    let val = {
        total: req.body.total,
        item: req.body.item,
        price: req.body.price,
        quantity: req.body.qty
    }
    console.log("val")
    console.log(val)
    res.end()
})



//step1:測試資料庫是否寫入 
app.get("/customer", (request, response) => {
    db.query("select * from cus_list", (error, results, fields) => { //results是資料庫query後丟出來的資料
        // console.log(results);   //測試資料庫寫入資料為何
        // response.send("ok");   //測試資料庫寫入與否寫入=> 可看出資料回傳的值事多少

        response.render("customer.hbs", { customer: results }) //edit BD format first==> go customer.hbs add{{# sales}}
        // console.log(results)
    });
});


//step2:.新增資料
app.get("/create-my-account", (req, res) => {
    res.render("customer_add.hbs");
    // res.render("customer_add.hbs"  ,{ layout:false }) // 此處, { layout:false }可以讓main.hbs的樣式也不被帶入(但等於在customer_add.hbs裡面的navbar也一起沒有)
});


//ajax拿著post的資料過來
app.post("/create-my-account", (req, res) => {

    const val = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phone: req.body.phone
    };

    // console.log(req.body.email)
    // console.log("ok1")
    // console.log(val);

    //後方多設一個!req.body.password是為防止條件通過後，每筆資料本身就會帶有req.body.email所以檢查都會通過
    if (req.body.email && !req.body.password) {
        // console.log(req.body.email)
        db.query("SELECT * FROM cus_list WHERE email=?;", [req.body.email], (error, results, fields) => {
            if (error) { return console.log("wrong") }

            if (results.length) {
                res.json({ info: "信箱已被使用過!", emailflag: false });
            } else if (!results.length) { res.json({ emailflag: true }) }



        }//db.query(error...fields){} end
        )//db.query() end
    }//if end


    else if (req.body.phone && !req.body.name) {
        db.query("SELECT * FROM cus_list WHERE phone=?",
            [req.body.phone],
            (error, results, fields) => {
                if (results.length) {
                    res.json({ info: "手機已被註冊!", phoneflag: false });

                } else if (!results.length) { res.json({ phoneflag: true }) }
            });
    }//if end

    else if (req.body.email && req.body.name && req.body.password && req.body.phone) {
        // console.log("ok"); //if 都成立，則可以新增資料

        db.query("insert into cus_list SET ?", val, (error, results, fields) => { //新增資料
            if (error) {
                console.log(error);
                res.send(error.sqlMessage); //如果err，顯示err的訊息
            } else if (results.affectedRows) { //如果有res.affected表示有一筆新增資料 => 新增成功 => redirect(/網址)
                // console.log(results);
                res.redirect("/customer");
            }
        });
    }
});

//step 3. 刪除 java delete
app.get("/customer/delete/:c_id", (req, res) => {
    //  res.render("customer.hbs"); //不需要如此，因為在customer.hbs按了刪除後，直接往customer.hbs 下方的<script>做動作，之後在get路徑"/customer/delete/:c_id"，並且db.query

    db.query("DELETE FROM cus_list WHERE c_id =?", [req.params.c_id], (error, results, fields) => {
        res.redirect("/customer");

    });
});

//step 3. 刪除 ajax delete
app.get("/customer/delete2/:c_id", (req, res) => {

    db.query("DELETE FROM cus_list WHERE c_id=?", [req.params.c_id], (error, results, fields) => {
        //    console.log(results)
        res.json(results);
    });//db.query end
}) //app.get end

//step 4. 修改
app.get("/customer/edit/:c_id", (req, res) => {

    db.query("SELECT * FROM cus_list WHERE c_id=?", [req.params.c_id], (error, results, fields) => {
        //   console.log(results); //回傳陣列
        //   console.log(results[0]) //回傳物件

        if (!results.length) { res.status(404); res.send("No Data!"); }
        else { res.render("customer_edit.hbs", { item: results[0] }); };
    });//dbquery end
})//app.get

//前端丟資料來了！
app.post("/customer/edit/:c_id", (req, res) => {

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
                        if (results.length) {  console.log("email重複")
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
                                    if (results.changedRows == true) { my_result = { success: true, affectedRows: 1, info: "修改成功" }; res.json(my_result); }
                                    else if (results.changedRows === 0) { my_result["info"] = "資料沒修改"; res.json(my_result); }

                                }

                            )//db.query for update

                        }

                    })//db.query for email

            }

        });//db.query for phone

});//app.post





//shoplist check
app.get("/shop", (request, response) => {
    response.render("shop.hbs");
});




app.get("/test", (request, response) => {
    response.render("test.hbs");
});



// Last Result 404 Error//==========================
app.use((req, res) => {
    res.type('text/plain');
    res.status(404);
    res.send('Page not found.....');
});

app.listen(3001, () => {
    console.log('server start...');
});




