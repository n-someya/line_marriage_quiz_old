'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const { Client } = require('pg');
const pg_client = new Client();

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
  console.log("test-req");
  console.log(req.body);
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
  if ( event.message.text === "ref" ) {
    const res = await pg_client.query('select * from answer;')
    const pgquery = { type: 'text', text: res };
    return client.replyMessage(event.replyToken, pgquery);
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
