const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.STEAM_API_KEY;

function getOneMonthAgoTimestamp() {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return Math.floor(date.getTime() / 1000);
}

const getAllGames = async () => {
  try {
    const response = await axios.get('https://api.steampowered.com/ISteamApps/GetAppList/v2/', {
      params: { key: apiKey }
    });
    return response.data.applist.apps.sort((a, b) => b.appid - a.appdid).slice(0, 500)
  } catch (error) {
    console.error('ZFailed to get all games', error);
    return [];
  }
};

const getGameDetails = async (appId) => {
  try {
    const response = await axios.get('https://store.steampowered.com/api/appdetails', {
      params: { appids: appId, key: apiKey },
    });
    return response.data[appId].data;
  } catch (error) {
    console.log(`Fialed to get details for game ${appId}`, error);
    return null;
  }
};

const getReviewHistogram = async (appId) => {
  try {
    const response = await axios.get(`https://store.steampowered.com/appreviewhistogram/${appId}?l=english`);
    return response.data.results;
  } catch (error) {
    console.log(`Failed to get review histogram for game ${appId}:`, error);
    return null;
  }
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
      if (!gameData || gameData.type !== 'game') return null;

      const releaseDate = new Date(gameData.release_date.date);
      if (releaseData.getTime() / 1000 < oneMonthAgo) return null;

      const reviewData = await getReviewHistogram(game.appid);
      if (!reviewData) return null;

      const reviewScore = calculateReviewScore(reviewData);
      if (reviewScore < 66.67) return null;

      return {
        name: gameData.name,
        url: `https://store.steampowered.com/app/${game.appid}`,
        players: gameData.owners || 0,
      };
    } catch (error) {
      console.error(`Error filtering game ${game.appid}:`, error);
      return null;
    }
  });

  const filteredGames = (await Promise.all(filteredGamesPromises)).filter(Boolean);
  filteredGames.sort((a, b) => a.players - b.players);  // Changed to ascending order

  return filteredGames;
};

const getFilteredGames = async () => {
  const allGames = await getAllGames();
  return filterGames(allGames);
};

// Exports
module.exports = {
  getFilteredGames,
  },
};
