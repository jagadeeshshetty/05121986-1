const express = require('express');
const app = express();


const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send(`Made with 💖 form 🇮🇳 - Jagadeesh C`));

app.get('/live', (req, res) => res.status(200).send('OK'));

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
