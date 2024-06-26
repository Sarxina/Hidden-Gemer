const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { getFilteredGames } = require('./steamService');

const app = express();
const port = 5000;

app.use(cors());

app.get('/api/games', async (req, res) => {
  try {
    const games = await getFilteredGames();
    console.log(games)
    res.json(games)
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
