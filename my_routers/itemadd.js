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
    if (req.session.loginUser != "root") {
        res.send("您無權訪問")
    }
    else {
        next()
    }

    addprod.get("/",(req,res)=>{

        
    })


})

module.exports = addprod