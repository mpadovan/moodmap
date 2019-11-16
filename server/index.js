require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require('fs');
const csv = require('csvtojson');
//const Pusher = require("pusher");

// create express application
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('./data/images'));
/*
// initialize pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APPID,
  key: process.env.PUSHER_APPKEY,
  secret: process.env.PUSHER_APPSECRET,
  cluster: process.env.PUSHER_APPCLUSTER,
  encrypted: true
});
*/
//  create application routes
app.post("/callback", function (req, res) {
  // now that we are here just go ahead and then
  console.log(req.body.emotion);
  // pusher.trigger("emotion_channel", "new_emotion", {
  //   emotion: req.body.emotion
  // });

  return res.json({ status: true });
});

app.get('/train', (req, res) => {
  csv({noheader: true})
    .fromFile('./data/legend.csv')
    .then((jsonObj) => {
      console.log(jsonObj);
      res.send(JSON.stringify(jsonObj));
    });
});

app.listen("3128");
