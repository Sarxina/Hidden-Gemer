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
      return response.data.applist.apps.sort((a, b) => b.appid - a.appid).slice(0, 500)
    } catch (error) {
      console.error('Failed to get all games', error);
      return [];
    }
  };

  const getGameDetails = async (appIds) => {
    try {
      const response = await axios.get('https://store.steampowered.com/api/appdetails', {
        params: { appids: appId, key: apiKey },
      });
      return response.data[appId].data;
    } catch (error) {
      console.log(`Failed to get details for game ${appId}`, error);
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

    return parseFloat(((totalRecommendationsUp / totalRecommendations) * 100).toFixed(2));
  };

  const getPlayerCount = async(appId) => {
    try {
      const response = axios.get(`https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/`, {
        params : {"appid" : appId, "key" : apiKey}
      });
    } catch (error) {
      //console.log(`Failed to get player count for game ${appId}:`, error);
      return null
    }
  }

module.exports = {
    getAllGames,
    getGameDetails,
    getReviewHistogram,
    getPlayerCount,
    calculateReviewScore,
    getOneMonthAgoTimestamp
}
