const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use(express.static('public')); 
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'micel11t', 
    database: 'smartfarm'
});

db.connect(err => {
    if (err) {
        throw err;
    }
    console.log('MySQL connected');
});

app.post('/api/farmInfo', (req, res) => {
    const { farmName, location } = req.body;
    const query = 'INSERT INTO farm_info (farmName, location) VALUES (?, ?)';
    db.query(query, [farmName, location], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send('Farm info added');
    });
});

app.post('/api/parameters', (req, res) => {
    const { farmID, temperature, humidity, soilMoisture } = req.body;
    const query = 'INSERT INTO parameters (farmID, temperature, humidity, soilMoisture) VALUES (?, ?, ?, ?)';
    db.query(query, [farmID, temperature, humidity, soilMoisture], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send('Parameters added');
    });
});

app.get('/api/farmInfo/:farmName', (req, res) => {
    const { farmName } = req.params;
    const query = 'SELECT farmID FROM farm_info WHERE farmName = ?';
    db.query(query, [farmName], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

app.get('/api/data', (req, res) => {
    const query = `
        SELECT farm_info.farmName, farm_info.location, parameters.farmID, parameters.temperature, parameters.humidity, parameters.soilMoisture
        FROM farm_info
        LEFT JOIN parameters ON farm_info.farmID = parameters.farmID;
    `;
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

app.get('/api/farmInfo', (req, res) => {
    const query = 'SELECT farmName FROM farm_info';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

app.delete('/api/data/:farmID', (req, res) => {
    const { farmID } = req.params;
    const deleteParametersQuery = 'DELETE FROM parameters WHERE farmID = ?';
    const deleteFarmInfoQuery = 'DELETE FROM farm_info WHERE farmID = ?';

    db.query(deleteParametersQuery, [farmID], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        db.query(deleteFarmInfoQuery, [farmID], (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.send('Data and farm info deleted');
        });
    });
});



const PORT = 3006;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
