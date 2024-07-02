// steamService.unit.test.js
jest.mock('../../../backend/steamServiceUtils', () => ({
    getAllGames: jest.fn(),
}));
jest.mock('../../../backend/filterGames')
const {filterGames} = require('../../../backend/filterGames');
const { getFilteredGames } = require('../../../backend/steamService');
const { getAllGames } = require('../../../backend/steamServiceUtils');

describe('steamService', () => {
    describe('getFilteredGames', () => {
        it('should get the list of all games and returned them filtered', async () => {
            const mockGameList = {"applist": {"apps" : [
                {"appid" : 1, "name" : "Game1"},
                {"appid" : 2, "name" : "Game2"},
            ]}};
            const mockReturnGameList = mockGameList.applist.apps.sort((a, b) => b.appid - a.appid).slice(0, 500);
            const mockFinalResult = [{"name" : "Game1", "url" : `https://store.steampowered.com/app/1`, "players" : 500}]

            getAllGames.mockResolvedValueOnce(mockReturnGameList);
            filterGames.mockResolvedValueOnce(mockFinalResult);

            const result = await getFilteredGames()
            expect(result).toEqual(mockFinalResult);

        });
    });
});
