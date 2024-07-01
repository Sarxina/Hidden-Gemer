const filterGames = async (games) => {
    const oneMonthAgo = getOneMonthAgoTimestamp();
    const filteredGamesPromises = games.map(async (game) => {
      try {
        const gameData = await getGameDetails(game.appid);
        if (!gameData || gameData.type !== 'game') return null;

        const releaseDate = new Date(gameData.release_date.date);
        if (releaseDate.getTime() / 1000 < oneMonthAgo) return null;

        const reviewData = await getReviewHistogram(game.appid);
        if (!reviewData) return null;

        const reviewScore = calculateReviewScore(reviewData.results);
        if (reviewScore < 66.67) return null;

        const currentPlayers = getPlayerCount(game.appid);

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


