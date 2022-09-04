const express = require("express");
const serverless = require("serverless-http");

const app = express();
const router = express.Router();

// router.get("/", (req, res) => {
//   res.json({
//     hello: "hi!"
//   });
// });

router.get('/test', (req, res) => {
  res.json({
    hello: "test!"
  });

})

router.post('/testpost', (req, res) => {
  res.json({
    hello: "hit the POST!"
  });
})

router.get('/', (req, res) => res.send(`Made with 💖 form 🇮🇳 - Jagadeesh C`));

router.get('/live', (req, res) => res.status(200).send('OK'));


app.use(`/.netlify/functions/api`, router);

module.exports = app;
module.exports.handler = serverless(app);
