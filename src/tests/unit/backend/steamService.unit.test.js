// steamService.unit.test.js
jest.mock('../../../backend/steamServiceUtils', () => ({
    getAllGames: jest.fn(),
    getGameDetails: jest.fn(),
    getReviewHistogram: jest.fn(),
    getPlayerCount: jest.fn(),
    calculateReviewScore: jest.fn()
}));
const fs = require('fs')
const {filterGames} = require('../../../backend/steamService');
const { getGameDetails, getReviewHistogram, getPlayerCount, getAllGames, calculateReviewScore } = require('../../../backend/steamServiceUtils');

describe('steamService', () => {
    describe('filterGames', () => {
        let formattedDate;
        beforeEach(() => {

            const today = new Date();
            const options = {year: 'numeric', month: 'short', day : 'numeric'};
            formattedDate = today.toLocaleDateString('en-US', options);

        });
        it('should filter games that are not of type "game', async () => {
            const mockGameList = {"applist": {"apps" : [
                {"appid" : 1, "name" : "Game1"},
                {"appid" : 2, "name" : "Game2"},
            ]}};
            const mockReturnGameList = mockGameList.applist.apps.sort((a, b) => b.appid - a.appid).slice(0, 500)
            const mockGameDetails1 = {"1" : {"data" : {
                "type" : "game",
                "name" : "Game1",
                "release_date" : {"date" : formattedDate}
            }}};
            const mockGameDetails2 = {"2" : {"data" : {
                "type" : "dlc",
                "name" : "Game2",
                "release_date" : {"date" : formattedDate}
            }}};
            const mockReviewHisogram1 = {"success": 1, "results" : {"recent" : [
                {"recommendations_up" : 100, "recommendations_down" : 1}
            ]}};
            const mockReviewHisogram2 = {"success": 1, "results" : {"recent" : [
                {"recommendations_up" : 100, "recommendations_down" : 1}
            ]}};

            getGameDetails.mockResolvedValueOnce(mockGameDetails1["1"].data);
            getGameDetails.mockResolvedValueOnce(mockGameDetails2["2"].data);
            getReviewHistogram.mockResolvedValueOnce(mockReviewHisogram1.results);
            //getReviewHistogram.mockResolvedValueOnce(mockReviewHisogram2.result);
            calculateReviewScore.mockResolvedValueOnce(99.00)
            //calculateReviewScore.mockResolvedValueOnce(99.00)
            getPlayerCount.mockResolvedValueOnce(500);
            getPlayerCount.mockResolvedValueOnce(500);


            const result = await filterGames(mockReturnGameList);

            expect(result).toEqual([
                {"name" : "Game1", "url" : `https://store.steampowered.com/app/1`, "players" : 500}
            ])
        });
    });
});
