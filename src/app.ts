import * as express from "express"
const Bot = require("./Bot")

const app = express()

app.get("/", (req, res) => {
    res.send("Online!")
})

module.exports = app