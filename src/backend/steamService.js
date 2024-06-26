const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.STEAM_API_KEY;

function getOneMonthAgoTimestamp() {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return Math.floor(date.getTime() / 1000);
}

const getAllGames = async () => {
  const response = await axios.get('https://api.steampowered.com/ISteamApps/GetAppList/v2/', {
    params: { key: apiKey }
  });
  const allGames = response.data.applist.apps;
  const recentGames = allGames.sort((a, b) => b.appid - a.appid).slice(0, 500);
  return recentGames;
};

const getGameDetails = async (appId) => {
  const response = await axios.get('https://store.steampowered.com/api/appdetails', {
    params: { appids: appId, key: apiKey },
  });
  return response.data[appId].data;
};

const getReviewHistogram = async (appId) => {
  const response = await axios.get(`https://store.steampowered.com/appreviewhistogram/${appId}?l=english`);
  return response.data.results;
};

const calculateReviewScore = (reviewData) => {
  const totalRecommendationsUp = reviewData.recent.reduce((acc, review) => acc + review.recommendations_up, 0);
  const totalRecommendationsDown = reviewData.recent.reduce((acc, review) => acc + review.recommendations_down, 0);
  const totalRecommendations = totalRecommendationsUp + totalRecommendationsDown;

  if (totalRecommendations === 0) {
    return 0;
  }

  return (totalRecommendationsUp / totalRecommendations) * 100;
};

const filterGames = async (games) => {
  const oneMonthAgo = getOneMonthAgoTimestamp();

  const filteredGamesPromises = games.map(async (game) => {
    try {
      const gameData = await getGameDetails(game.appid);

      if (!gameData || gameData.type !== 'game') {
        return null;
      }

      const releaseDate = new Date(gameData.release_date.date);
      if (releaseDate.getTime() / 1000 < oneMonthAgo) {
        return null;
      }

      const reviewData = await getReviewHistogram(game.appid);
      const reviewScore = calculateReviewScore(reviewData);

      if (reviewScore < 66.67) {
        return null;
      }

      return {
        name: gameData.name,
        url: `https://store.steampowered.com/app/${game.appid}`,
        players: gameData.owners || 0,
      };
    } catch (error) {
      return null;
    }
  });

  const filteredGames = (await Promise.all(filteredGamesPromises)).filter(Boolean);
  filteredGames.sort((a, b) => a.players - b.players);  // Changed to ascending order

  return filteredGames;
};

const getFilteredGames = async () => {
  const allGames = await getAllGames();
  const filteredGames = await filterGames(allGames);
  return filteredGames;
};

module.exports = {
  getFilteredGames,
};
