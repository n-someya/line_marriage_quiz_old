'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const { Client } = require('pg');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/webhook', line.middleware(config), (req, res) => {
  console.log(req.body);
  // 
  //   .then(res => {
  //     pg_client.query('select * from answers;')
  //       .then(res => {
  //         console.log("DB connect ok: ", res);
  //       }).catch(e => {
  //         console.log("DB connect ng: ", e.stack);
  //       });
  //   });
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result));
});

// event handler
function handleEvent(event) {
  const pg_client = new Client();
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }
  if (event.message.text === "ref") {
    console.log("ref: comming !!!!!!");
    return pg_client.connect()
      .then(res => {
        pg_client.query('select * from answers;')
          .then(res => {
            const pgquery = { type: 'text', text: JSON.stringify(res) };
            console.log("DB connect ok: ", res);
            return client.replyMessage(event.replyToken, pgquery);
          }).catch(e => {
            const pgquery = { type: 'text', text: e.stack };
            console.log("DB connect ng: ", e.stack);
            return client.replyMessage(event.replyToken, pgquery);
          })
      });
  }else{
    return pg_client.connect()
    .then(res =>{
      //現在の設問番号を取得
      pg_client.query('select coalesce((select max(stage)  from corrects), 0) + 1;')
      .then(res => {
        const pgquery = {
          type: 'text',
          text: "現在の問題番号は " + res + " です。" 
        };
        return client.replyMessage(event.replyToken, pgquery);
      })
    })
  }
  const text = event.message.text + "イカ？";
  // create a echoing text message
  const echo = { type: 'text', text: text };
  console.log("userid=")
  console.log(event.source.userId)

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
