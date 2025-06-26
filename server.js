const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

const apiRoutes = require('./routes/api.js');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

apiRoutes(app);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Server is listening on port ' + port);
});

module.exports = app; // para pruebas
