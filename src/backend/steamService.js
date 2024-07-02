

const {getAllGames} = require('./steamServiceUtils');
const {filterGames} = require('./filterGames');

const getFilteredGames = async () => {
  const allGames = await getAllGames();
  return filterGames(allGames);
};

// Exports
module.exports = {
  getFilteredGames
}
