jest.mock('../../../backend/steamServiceUtils')
const fs = require('fs')
const {filterGames} = require('../../../backend/filterGames');
const { getGameDetails, getReviewHistogram, getPlayerCount, calculateReviewScore } = require('../../../backend/steamServiceUtils');

describe('filterGames', () => {
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

            const mockGameDetails = {
                "1" : mockGameDetails1,
                "2" : mockGameDetails2
            }

            const mockReviewHisogram1 = {"success": 1, "results" : {"recent" : [
                {"recommendations_up" : 100, "recommendations_down" : 1}
            ]}};
            const mockReviewHisogram2 = {"success": 1, "results" : {"recent" : [
                {"recommendations_up" : 100, "recommendations_down" : 1}
            ]}};

            // getGameDetails.mockResolvedValueOnce(mockGameDetails1["1"].data);
            // getGameDetails.mockResolvedValueOnce(mockGameDetails2["2"].data);

            getGameDetails.mockImplementation((appid) => {
                return Promise.resolve(mockGameDetails[appid])
            });

            getReviewHistogram.mockResolvedValueOnce(mockReviewHisogram1.results);
            //getReviewHistogram.mockResolvedValueOnce(mockReviewHisogram2.result);
            calculateReviewScore.mockResolvedValueOnce(99.00)
            //calculateReviewScore.mockResolvedValueOnce(99.00)
            getPlayerCount.mockResolvedValueOnce(500);
            getPlayerCount.mockResolvedValueOnce(500);

            const result = await filterGames(mockReturnGameList);
            // // Added logs to ensure proper mock setup
            // console.log("Mock Game Details 1:", mockGameDetails1["1"].data);
            // console.log("Mock Game Details 2:", mockGameDetails2["2"].data);
            // console.log("Result:", result);

            expect(result).toEqual([
                {"name" : "Game1", "url" : `https://store.steampowered.com/app/1`, "players" : 500}
            ])
        });
    });
});

