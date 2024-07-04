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
                }}},
                "reviewHistogram" : goodHistogram,
                "reviewScore" : 99.00,
                "players" : 500
            };

            // Details of a dlc
            const dlcGameDetails = {
                "response" : {"2" : {"data" : {
                    "type" : "dlc",
                    "name" : "DLC Game",
                    "release_date" : {"date" : formattedDate}
                }}},
                "reviewHistogram" : goodHistogram,
                "reviewScore" : 99.0,
                "players" : 500
            };

            // Details of a game released two months ago
            const twoMonthsAgo = new Date(today);
            twoMonthsAgo.setMonth(today.getMonth() - 2);
            const twoMonthsAgoFormatted = twoMonthsAgo.toLocaleDateString('en-US', options);
            const oldGameDetails = {
                "response" : {"3" : {"data" : {
                    "type" : "game",
                    "name" : "Old Game",
                    "release_date" : {"date" : twoMonthsAgoFormatted}
                }}},
                "reviewHistogram" : goodHistogram,
                "reviewScore" : 99.0,
                "players" : 500
            };

            // Details of a game with a null histogram
            const noHistogramGameDetails = {
                "response" : {"4" : {"data" : {
                    "type" : "game",
                    "name" : "Game With No Histogram",
                    "release_date" : {"date" : formattedDate}
                }}},
                "reviewHistogram" : null,
                "reviewScore" : 99.00,
                "players" : 500
            };

            // Details of a game with no recent reviews
            const noRecentReviewHistogram = {
                "response" : {"5" : {"data" : {
                    "type" : "game",
                    "name" : "Game With No Recent Histogram",
                    "release_date" : {"date": formattedDate}
                }}},
                "reviewHistogram" : {"success" : 1, "results" : {"rollups" : [
                    {"date" : 1643673600, "recommendations_up" : 100, "recommendations_down" : 1}
                ]}},
                "reviewScore": 99.00,
                "players" : 500
            };

            // Details of a game with no recent reviews
            const emptyRecentReviewHistogram = {
                "response" : {"6" : {"data" : {
                    "type" : "game",
                    "name" : "Game With Empty Recent Histogram",
                    "release_date" : {"date": formattedDate}
                }}},
                "reviewHistogram" : {"success" : 1, "results" : {"recent" : []}},
                "reviewScore" : 0,
                "players" : 500
            };

                        // Details of a game with no recent reviews
            const badReviewGame = {
                "response" : {"7" : {"data" : {
                    "type" : "game",
                    "name" : "Bad Review Game",
                    "release_date" : {"date": formattedDate}
                }}},
                "reviewHistogram" : {"success" : 1, "results" : {"rollups" : [
                    {"date" : 1643673600, "recommendations_up" : 6666, "recommendations_down" : 10000}
                ]}},
                "reviewScore" : 66.66,
                "players" : 500
            }

            // Details of a typical game with good reviews
            const normalGame2 = {
                "response" : {"8" : {"data" : {
                    "type" : "game",
                    "name" : "Normal Game 2",
                    "release_date" : {"date" : formattedDate}
                }}},
                "reviewHistogram" : goodHistogram,
                "reviewScore" : 999.00,
                "players" : 499
            };

            const mockGameDetails = {
                "1" : mockGameDetails1,
                "2" : dlcGameDetails,
                "3" : oldGameDetails,
                "4" : noHistogramGameDetails,
                "5" : noRecentReviewHistogram,
                "6" : emptyRecentReviewHistogram,
                "7" : badReviewGame,
                "8" : normalGame2
            }

            // Mock implementation of getGameDetails
            getGameDetails.mockImplementation((appid) => {
                return mockGameDetails[appid].response[appid].data;
            });

            // Mock implementation of getReviewHistogram
            getReviewHistogram.mockImplementation((appid) => {

                return mockGameDetails[appid].reviewHistogram
            });
            // TODO: Properly mock without implementing the logic
            // Unfortunately since the review histogram doesn't have the appid
            // we don't have a way to overcome the asyncronicty issue atm
            // Mock implementation of calculateReviewScore
            calculateReviewScore.mockImplementation((reviewData) => {
                const totalRecommendationsUp = reviewData.recent.reduce((acc, review) => acc + review.recommendations_up, 0);
                const totalRecommendationsDown = reviewData.recent.reduce((acc, review) => acc + review.recommendations_down, 0);
                const totalRecommendations = totalRecommendationsUp + totalRecommendationsDown;

                if (totalRecommendations === 0) {
                  return 0;
                }

                return parseFloat(((totalRecommendationsUp / totalRecommendations) * 100).toFixed(2));
            });
            // Mock implementation of getPlayerCount
            getPlayerCount.mockImplementation((appid) => {
                return mockGameDetails[appid].players
            });
        });
        it('should filter games that are not of type "game', async () => {
            const mockGameList = {"applist": {"apps" : [
                {"appid" : 1, "name" : "Game1"},
                {"appid" : 2, "name" : "Game2"},
            ]}};
            const mockReturnGameList = mockGameList.applist.apps.sort((a, b) => b.appid - a.appid).slice(0, 500)

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

            const result = await filterGames(mockReturnGameList);

            expect(result).toEqual([
                {"name" : "Game1", "url" : "https://store.steampowered.com/app/1", "players" : 500}
            ]);
        });
        it('should filter games without a "recent" field in their review histogram', async() => {
            const mockGameList = {"applist": {"apps" : [
                {"appid" : 1, "name" : "Game1"},
                {"appid" : 5, "name" : "Game With No Recent Histogram"},
            ]}};
            const mockReturnGameList = mockGameList.applist.apps.sort((a, b) => b.appid - a.appid).slice(0, 500);

            const result = await filterGames(mockReturnGameList);

            expect(result).toEqual([
                {"name" : "Game1", "url" : "https://store.steampowered.com/app/1", "players" : 500}
            ]);
        })
        it('should filter games with an empty "recent" field in their review hisogram', async() => {
            const mockGameList = {"applist": {"apps" : [
                {"appid" : 1, "name" : "Game1"},
                {"appid" : 6, "name" : "Game With Empty Recent Histogram"},
            ]}};
            const mockReturnGameList = mockGameList.applist.apps.sort((a, b) => b.appid - a.appid).slice(0, 500);

            const result = await filterGames(mockReturnGameList);

            expect(result).toEqual([
                {"name" : "Game1", "url" : "https://store.steampowered.com/app/1", "players" : 500}
            ]);
        });
        it('should filter games with a review score less than 66.67', async() => {
            const mockGameList = {"applist": {"apps" : [
                {"appid" : 1, "name" : "Game1"},
                {"appid" : 7, "name" : "Game With Bad Review Score"},
            ]}};
            const mockReturnGameList = mockGameList.applist.apps.sort((a, b) => b.appid - a.appid).slice(0, 500);

            const result = await filterGames(mockReturnGameList);

            expect(result).toEqual([
                {"name" : "Game1", "url" : "https://store.steampowered.com/app/1", "players" : 500}
            ]);
        })
        it('should order returning games in ascending order of player count', async() => {
            const mockGameList = {"applist": {"apps" : [
                {"appid" : 1, "name" : "Game1"},
                {"appid" : 8, "name" : "Normal Game 2"},
            ]}};
            const mockReturnGameList = mockGameList.applist.apps.sort((a, b) => b.appid - a.appid).slice(0, 500)

            const result = await filterGames(mockReturnGameList);

            expect(result).toEqual([
                {"name" : "Normal Game 2", "url" : `https://store.steampowered.com/app/8`, "players" : 499},
                {"name" : "Game1", "url" : `https://store.steampowered.com/app/1`, "players" : 500}
            ])
        })
    });
});

