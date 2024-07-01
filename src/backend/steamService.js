const { getAllGames, getGameDetails, getReviewHistogram, getPlayerCount, calculateReviewScore } = require('./steamServiceUtils');



const getFilteredGames = async () => {
  const allGames = await getAllGames();
  return filterGames(allGames);
};

// Exports
module.exports = {
  getFilteredGames
}
