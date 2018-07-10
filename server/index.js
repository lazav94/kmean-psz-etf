const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const winston = require('winston');
require('dotenv').config();

const log = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: 'combined.log'
        })
    ]
});

const app = express();

process.on('unhandledRejection', (reason, p) => {
    console.log('🚧 UnhandledPromiseRejectionWarning: Unhandled promise rejection', p, ' reason: ', reason);
});

app.set('port', process.env.PORT || 8081);
app.use(express.static(path.join(__dirname, 'public')));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

mongoose.connect(process.env.MONGO_URI, {
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
    autoReconnect: true
}, (error, db) => {
    console.log('Connected to Database!');
    if (error) {
        console.error('Mongo error', error);
    }
});

mongoose.Promise = global.Promise;

app.use(bodyParser.json({}));
app.use(bodyParser.urlencoded({
    extended: false
}));

require('./routes')(app);

app.listen(app.get('port'), () => {
    console.log('PSZ Running on port:', app.get('port'));
});
module.exports = app;