const {getOneMonthAgoTimestamp, getGameDetails, getReviewHistogram, calculateReviewScore, getPlayerCount} = require('./steamServiceUtils')

const filterGames = async (games) => {
    const oneMonthAgo = getOneMonthAgoTimestamp();
    const filteredGamesPromises = games.map(async (game) => {
      try {
        const gameData = await getGameDetails(game.appid);
        console.log(gameData)
        if (!gameData || gameData.type !== 'game') return null;
        console.log("made it past gamedetails");

        const releaseDate = new Date(gameData.release_date.date);
        if (releaseDate.getTime() / 1000 < oneMonthAgo) return null;
        console.log("Made it past get time");

        console.log(`Sending ${game.appid} to getReviewHistogram`);
        const reviewData = await getReviewHistogram(game.appid);
        console.log(reviewData)
        if (!reviewData || !reviewData.results.recent || reviewData.results.recent.length === 0) return null;
        console.log("made it past review data")

        const reviewScore = calculateReviewScore(reviewData.results);
        if (reviewScore < 66.67) return null;
        console.log("Made it past review score")

        const currentPlayers = await getPlayerCount(game.appid);

        //console.log(gameData)
        //console.log(game)
        return {
          name: gameData.name,
          url: `https://store.steampowered.com/app/${game.appid}`,
          players: currentPlayers,
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

module.exports = {
  filterGames
};
