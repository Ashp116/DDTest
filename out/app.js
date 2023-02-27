"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const Bot = require("./Bot");
const app = express();
app.get("/", (req, res) => {
    res.send("Online!");
});
module.exports = app;
