'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const NCMB = require('ncmb');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const ncmb = new NCMB(process.env.NCMB_APPLICATION_KEY, process.env.NCMB_CLIENT_KEY);
const TestClass = ncmb.DataStore("TestClass");

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result));
});

// event handler
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  const text = event.message.text + "イカ？";
  // create a echoing text message
  const echo = { type: 'text', text: text };
  console.log("userid=")
  console.log(event.source.userId)

  var testClass = new TestClass();
  testClass.set("userid", event.source.userId);
  testClass.set("answer", event.message.text);
  testClass.save()
           .then(function(){
              // 保存に成功した場合の処理
            })
           .catch(function(err){
              // 保存に失敗した場合の処理
            });
  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
