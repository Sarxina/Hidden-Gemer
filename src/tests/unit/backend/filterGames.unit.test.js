jest.mock('../../../backend/steamServiceUtils')
const fs = require('fs')
const {filterGames} = require('../../../backend/filterGames');
const { getGameDetails, getReviewHistogram, getPlayerCount, calculateReviewScore, getOneMonthAgoTimestamp } = require('../../../backend/steamServiceUtils');

describe('filterGames', () => {
    describe('filterGames', () => {
        let formattedDate;
        // A variety of mock game details that we will use over and over
        beforeAll(() => {
            const today = new Date();
            const options = {year: 'numeric', month: 'short', day : 'numeric'};
            formattedDate = today.toLocaleDateString('en-US', options);

            const date = new Date();
            date.setMonth(date.getMonth() - 1);
            getOneMonthAgoTimestamp.mockReturnValue(Math.floor(date.getTime() / 1000));

            // Histogram with good reviews, used for moth test details
            const goodHistogram = {"success": 1, "results" : {"recent" : [
                {"recommendations_up" : 100, "recommendations_down" : 1}
            ]}};

            // Details of a typical game with good reviews
            const mockGameDetails1 = {
                "response" : {"1" : {"data" : {
                    "type" : "game",
                    "name" : "Game1",
                    "release_date" : {"date" : formattedDate}
                },
                "reviewHistogram" : {"success" : 1, "results" : {"recent" : [
                    {"recommendations_up" : 100, "recommendations_down" : 1}
                ]}}
            }}};

            // Details of a dlc
            const dlcGameDetails = {
                "response" : {"2" : {"data" : {
                    "type" : "dlc",
                    "name" : "DLC Game",
                    "release_date" : {"date" : formattedDate}
                },
                "reviewHistogram" : goodHistogram
            }}};

            // Details of a game released two months ago
            const twoMonthsAgo = new Date(today);
            twoMonthsAgo.setMonth(today.getMonth() - 2);
            const twoMonthsAgoFormatted = twoMonthsAgo.toLocaleDateString('en-US', options);
            const oldGameDetails = {
                "response" : {"3" : {"data" : {
                    "type" : "game",
                    "name" : "Old Game",
                    "release_date" : {"date" : twoMonthsAgoFormatted}
                },
                "reviewHistogram" : goodHistogram
            }}};

            // Details of a game with a null histogram
            const noHistogramGameDetails = {
                "response" : {"4" : {"data" : {
                    "type" : "game",
                    "name" : "Game With No Histogram",
                    "release_date" : {"date" : formattedDate}
                },
                "reviewHistogram" : null
            }}};

            const mockGameDetails = {
                "1" : mockGameDetails1,
                "2" : dlcGameDetails,
                "3" : oldGameDetails,
                "4" : noHistogramGameDetails
            }

            // Mock implementation of getGameDetails
            getGameDetails.mockImplementation((appid) => {
                console.log(mockGameDetails[appid].response[appid].data)
                return mockGameDetails[appid].response[appid].data;
            });

            // Mock implementation of getReviewHistogram
            getReviewHistogram.mockImplementation((appid) => {
                // console.log(`Recieved histogram ${appid}`)
                // console.log(`Sending off ${mockGameDetails[appid].response[appid].data}`)
                return mockGameDetails[appid].reviewHistogram
            });
        });
        it('should filter games that are not of type "game', async () => {
            const mockGameList = {"applist": {"apps" : [
                {"appid" : 1, "name" : "Game1"},
                {"appid" : 2, "name" : "Game2"},
            ]}};
            const mockReturnGameList = mockGameList.applist.apps.sort((a, b) => b.appid - a.appid).slice(0, 500)

            calculateReviewScore.mockResolvedValueOnce(99.00)
            getPlayerCount.mockResolvedValueOnce(500);

            const result = await filterGames(mockReturnGameList);

            expect(result).toEqual([
                {"name" : "Game1", "url" : `https://store.steampowered.com/app/1`, "players" : 500}
            ])
        });
        it('should filter games that were released over a month ago', async() => {
            const mockGameList = {"applist": {"apps" : [
                {"appid" : 1, "name" : "Game1"},
                {"appid" : 3, "name" : "Old Game"},
            ]}};
            const mockReturnGameList = mockGameList.applist.apps.sort((a, b) => b.appid - a.appid).slice(0, 500);

            calculateReviewScore.mockResolvedValueOnce(99.00);
            getPlayerCount.mockResolvedValueOnce(500);

            const result = await filterGames(mockReturnGameList);

            expect(result).toEqual([
                {"name" : "Game1", "url" : "https://store.steampowered.com/app/1", "players" : 500}
            ]);
        });
        if('should filter games without a review histogram', async() => {
            const mockGameList = {"applist": {"apps" : [
                {"appid" : 1, "name" : "Game1"},
                {"appid" : 4, "name" : "Game With No Histogram"},
            ]}};
            const mockReturnGameList = mockGameList.applist.apps.sort((a, b) => b.appid - a.appid).slice(0, 500);

            calculateReviewScore.mockResolvedValueOnce(99.99);
            getPlayerCount.mockResolvedValueOnce(500);

            const result = await filterGames(mockReturnGameList);

            expect(result).toEqual([
                {"name" : "Game1", "url" : "https://store.steampowered.com/app/1", "players" : 500}
            ]);
        });
    });
});

