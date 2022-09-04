const express = require('express');
const path = require('path');
const app = express();


const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/live', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
