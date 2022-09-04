const express = require('express');
const multer = require('multer');
const { createWorker } = require('tesseract.js');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');
const qs = require('qs');


const PORT = process.env.PORT || 3000;
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: function (req, file, cb) {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage });

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
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

app.post('/testImgToTxt', upload.single('file'), async (req, res) => {
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize('https://tesseract.projectnaptha.com/img/eng_bw.png');
    console.log(text);
    // await worker.terminate();
    // res.status(200);
    // res.json({ "status": res.statusCode, "message": "File uploaded successfully", "data": text });
    res.send(text);
});

app.post('/imgToTxt', upload.single('file'), async (req, res) => {
    console.log(req.file);
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(req.file.destination + '/' + req.file.filename);
    console.log(text);
    res.send(text);
});

app.post('/base64ToTxt', async (req, res) => {
    // var timeLog = new Date();
    // var logMessage = `==== [iLog] ${timeLog} ====`;
    // const worker = createWorker();
    // let workerLoad = await worker.load();
    // console.log(workerLoad);
    // await worker.loadLanguage('eng');
    // await worker.initialize('eng');
    // const { data: { text } } = await worker.recognize(req.body.base64image);
    // console.log(logMessage);
    // console.log(text);
    // console.log('='.repeat(logMessage.toString().length));
    // await worker.terminate();
    // res.json({ "status": res.statusCode, "message": "File processed successfully", "data": text, "timeLog": timeLog.toString() });
    const worker = createWorker();
    let timeLog = new Date();
    let logMessage = `==== [iLog] ${timeLog} ====`;
    let count = 1;
    let timeout = 10;

    console.log(logMessage);
    let _text = await getText(req.body.base64image, worker);
    console.log(_text);
    while (!_text && count <= timeout) {
        await sleep(8000);
        console.log(`There is an error with tessdata load. Will keep try not more than ${count} times.`);
        _text = await getText(req.body.base64image, worker);
        count++;
    }
    await worker.terminate();
    console.log('='.repeat(logMessage.toString().length));

    if (!_text) res.status(503);
    res.json({ "status": res.statusCode, "message": "File processed successfully", "data": _text, "timeLog": timeLog.toString() });
});

app.post('/v2base64ToTxt', async (req, res) => {
    const worker = createWorker();
    let timeLog = new Date();
    let logMessage = `==== [iLog] ${timeLog} ====`;
    let count = 1;
    let timeout = 10;

    console.log(logMessage);
    let _text = await getText(req.body.base64image, worker);
    console.log(_text);
    while (!_text && count <= timeout) {
        await sleep(8000);
        console.log(`There is an error with tessdata load. Will keep try not more than ${count} times.`);
        _text = await getText(req.body.base64image, worker);
        count++;
    }
    await worker.terminate();
    console.log('='.repeat(logMessage.toString().length));

    if (!_text) res.status(503);
    res.json({ "status": res.statusCode, "message": "File processed successfully", "data": _text, "timeLog": timeLog.toString() });
});

async function getText(_base64image, worker) {
    try {
        const workerLoad = await worker.load();
        console.log(workerLoad);
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const { data: { text } } = await worker.recognize(_base64image);
        console.log(text);
        return { text, workerLoad };
        // new throws('Error');
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function sleep(ms) {
    console.log(`Halt for ${ms / 1000} sec.`);
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Load balance endpoint.
app.post('/v2/base64ToTxt', async (req, res) => {
    // 1. Set the Node number. There are 1 to 9 Nodes available.
    let node = Math.floor(Math.random() * 9) + 1;
    let nodeURL = `http://test-05121986-${node}.herokuapp.com/base64ToTxt`;
    console.log(nodeURL);
    // 2. Send the request to the Node.
    let response = await parse(req, nodeURL);
    // 3. For successful response, return the response.
    if (response.status === 200) {
        response.data['nodeURL'] = nodeURL;
        console.log(response.data);
        res.json(response.data);
    }
    // 4. For error response, return the error response code.
    else {
        res.status(response.status);
    }
});

async function parse(req, _url) {
    var data = qs.stringify({
        'base64image': req.body.base64image
    });
    var config = {
        method: 'post',
        url: _url,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data
    };

    let response = await axios(config);

    console.log(response.status);

    if (response.status === 200) {
        console.log(response.data);
        return response;
    } else {
        return response.status;
        // res.status(503);
    }
}

async function _try() {
    try {
        let node = Math.floor(Math.random() * 10) + 1;
        let newNode;
        let nodeURL;
        let completed = false;
        let count = 1;
        let _count = 1;
        let timeout = 10;
        let response;

        do {
            // let nodeURL = `https://jagadeesh-05121986-ocr-staging.herokuapp.com/base64ToTxt`;
            // nodeURL = `http://test-05121986-1.herokuapp.com/v2/base64ToTxt`;
            nodeURL = `http://test-05121986-${node}.herokuapp.com/v2/base64ToTxt`;
            console.log(nodeURL);
            response = await parse(req, nodeURL);
            console.log(response);
            sleep(28000);

            if (response.status === 200) {
                completed = true;
                res.json(response.data);
                return;
            }

            newNode = Math.floor(Math.random() * 10) + 1;
            while (newNode === node && _count <= 10) {
                newNode = Math.floor(Math.random() * 10) + 1;
                _count++;
            }
            _count = 1;
            count++;
        } while (!completed && count <= timeout);

        // while (!completed && count <= timeout) {
        //     // let response = await parse(req, 'https://jagadeesh-05121986-ocr-staging.herokuapp.com/base64ToTxt');
        //     nodeURL = `http://test-05121986-${node}.herokuapp.com/v2/base64ToTxt`;
        //     // nodeURL = `http://test-05121986-1.herokuapp.com/v2/base64ToTxt`;
        //     console.log(nodeURL);
        //     response = await parse(req, nodeURL);
        //     console.log(response);
        //     if (response.status === 200) {
        //         completed = true;
        //         res.json(response.data);
        //     }
        //     newNode = Math.floor(Math.random() * 10) + 1;
        //     while (newNode === node && _count <= 10) {
        //         newNode = Math.floor(Math.random() * 10) + 1;
        //         _count++;
        //     }
        //     _count = 1;
        //     count++;
        // }

        res.status(response.status);
        res.json(`Tried ${count} times but failed.`);
    } catch (error) {
        console.log(error);
        res.status(500);
        res.send(error);
    }
}