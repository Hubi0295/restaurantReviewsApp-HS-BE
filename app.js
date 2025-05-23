require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const authRouter = require('./routes/auth');
const apiRouter = require('./routes/api');
const connection = require('./db');
connection();
app.use('/auth', authRouter);
app.use('/api',apiRouter);
module.exports = app;
