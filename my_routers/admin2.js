const express =require("express");
const router = express.Router();
//上面兩句可以縮成const router = require("express").Router();
router.get("/admin2/:p1?/:p2??", (request,response)=>{
response.send("admin2:" + JSON.stringify(request.params));
});
module.exports = router;