require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res) => {
  res.status(404).json({ message: 'path not found on this server' });
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({ message: err.message });
});

sequelize.sync({ force: true }).then(() => console.log('DB Sync'));

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`server running on port ${port}`));
