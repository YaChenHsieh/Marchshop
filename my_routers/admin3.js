const router = require("express").Router();

router.route("/member/edit/:id")

.all((request,response,next)=>{
response.locals.memberData={
    name:"Angel",
    id:"A001"};
next();
}) 
//接續上方，不放;//   => router.route.all.get.post

.get((request,response)=>{
const obj={
baseUrl : request.baseUrl,
url : request.url,
data : response.locals.memberData 
};
response.send("get info" + JSON.stringify(obj));
})

//接續上方
.post((request,response)=>{
response.send("post info" + JSON.stringify(response.locals.memberData))
}); //結束的分號
//最後export router給app.js裡面的admin3使用
module.exports = router; 

