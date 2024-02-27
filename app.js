const express = require('express');
const path = require('path');
const fs = require('fs');
const fileutils = require('./fileutils');
//file upload module
const multer = require('multer');
const upload = multer({ preservePath: true });
const dbutils = require('./dbutils');
const { createDb } = require('./dbutils');

const app = express();
app.use(express.static(path.join(process.cwd(), '/public')));
const PORT = 3003;

// check if the directories exist
fileutils.checkDirectory('database');

const bodyParser = require('body-parser');
const { create } = require('domain');
app.use(bodyParser.json());
// let's create the database if it does not exist
createDb();
// here we serve the file "index.html" 
app.get('/', (req, res) => {
    res.setHeader('Content-type', 'text/html');
    let indexFile = fs.readFileSync(path.join(process.cwd(), 'index.html'));
    res.write(indexFile, (err) => {
        if (err) throw err;
    });
    res.end();
});

// if client posts data using our "hash" method, we get it here
// app.post('/hash', (req, res) => {
//     const hash = req.body.hash;
//     let fileName = path.join(process.cwd(), 'storage', hash + '.sample');
//     let val = dbutils.isHashInDb(hash);
//     if (val) {
//         res.status(200).send({
//             exists: true,
//             status: "You don't need to send this file"
//         });

//     } else {
//         res.status(200).send({
//             exists: false,
//             status: "Ready to send"
//         });

//     }
// });

app.get('/getnotes', (req, res) => {
    const notes = dbutils.getNotes();
    res.status(200).send({ notes: notes, status: "Notes retrieved" });
});

app.post('/delete', (req, res) => {
    const id = req.body.id;
    if (id === undefined) {
        res.status(404).send({ status: "Error deleting note", error: "Invalid id" });
        return;
    }
    const result = dbutils.deleteNote(id);
    if (result.changes === 0) {
        res.status(500).send({ status: "Error deleting note", error: "Internal server error" });
    } else {
        res.status(200).send({ status: "Note deleted" });
    }
});

app.post('/insert', (req, res) => {
    const text = req.body.text;
    const result = dbutils.insertNewNote(text, false);
    if (result.lastInsertRowid && result.lastInsertRowid > 0) {
        res.status(200).send({ status: "Note inserted", id: result.lastInsertRowid });
    } else {
        res.status(500).send({ status: "Error inserting note", error: "Internal server error" });
    }
});

// app.post('/upload', upload.single('sample'), function (req, res, next) {
//     let hash = req.body.hashHex;
//     let fileName = req.file.originalname;
//     let fileSize = req.file.size;
//     let directory = req.body.filePath;
//     let physicalFileName = path.join(process.cwd(), 'storage', hash + '.sample');
//     if (hash === undefined || fileName === undefined || fileSize === undefined || directory === undefined) {
//         res.status(403).send('Invalid data');
//         res.end();
//         return;
//     }

//     let { isPE, hexHash } = fileutils.checkBuffer(req.file.buffer);
//     if (!isPE) {
//         res.status(403).send('Invalid data');
//         res.end();
//         return;
//     }

//     if (hexHash !== hash || dbutils.isHashInDb(hash)) {
//         res.status(403).send('Invalid data');
//         res.end();
//         return;
//     }

//     fs.writeFileSync(physicalFileName, req.file.buffer);
//     dbutils.insertHash(hash, fileName, fileSize, directory);
//     res.status(200).redirect('/');
//     res.end();
// });

app.get("*", (req, res) => {
    res.setHeader('Content-type', 'text/html');
    const file404 = fs.readFileSync(path.join(process.cwd(), 'notfound.html'));
    res.write(file404, (err) => {
        if (err) throw err;
    });
    res.end();
});

app.listen(PORT, () => {
    console.log(`Server is running at: http://127.0.0.1:${PORT}`);
});

module.exports = app;