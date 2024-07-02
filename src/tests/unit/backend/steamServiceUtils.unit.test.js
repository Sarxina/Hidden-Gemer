jest.mock('axios');
const axios = require('axios');
const fs = require('fs')

const { getAllGames, getGameDetails, getReviewHistogram, getPlayerCount, calculateReviewScore } = require('../../../backend/steamServiceUtils');


describe("steamServiceUtils", () => {
    afterEach(() => {
        axios.reset();
    });
    describe("getAllGames", () => {
        it('should fetch and return all games, sorted by appid descending, limited to 500', async () => {
            const mockGames = Array.from({ length: 600 }, (_, i) => ({ appid: i, name: `Game ${i}` }));
            axios.get.mockResolvedValue({
                data: { applist: { apps: mockGames } },
            });

            const result = await getAllGames();

            expect(axios.get).toHaveBeenCalledWith('https://api.steampowered.com/ISteamApps/GetAppList/v2/', { params: { key: process.env.STEAM_API_KEY } });
            expect(result).toHaveLength(500);
            expect(result[0].appid).toBe(599);
            expect(result[499].appid).toBe(100);
        });
        it('should handle errors and return an empty array', async () => {
            axios.get.mockRejectedValue(new Error('API error'));

            const result = await getAllGames();

            expect(result).toEqual([]);
        });
    });
    describe('getGameDetails', () => {
        it('should fetch and return game details', async () => {
            const mockGameDetails = JSON.parse(fs.readFileSync('src/tests/unit/backend/testEldenRingDetails.json', 'utf8'));
            const expectedData = mockGameDetails["1245620"].data

            axios.get.mockResolvedValue({data: mockGameDetails});

            const result = await getGameDetails(1245620)

            expect(axios.get).toHaveBeenCalledWith('https://store.steampowered.com/api/appdetails', {
                 params: { appids: 1245620, key: process.env.STEAM_API_KEY
                 }});
            expect(result).toEqual(expectedData);
        });
        it('should handle errors and return null', async() => {
            axios.get.mockRejectedValue(new Error('API error'));

            const result = await getGameDetails();

            expect(result).toEqual(null);
        });
    });
    describe('getReviewHistogram', () => {
        it('should fetch and return game review histogram', async () => {
            const mockGameHistogram = JSON.parse(fs.readFileSync('src/tests/unit/backend/testEldenRingReviews.json', 'utf8'));
            const expectedData = mockGameHistogram.results

            axios.get.mockResolvedValue({data: mockGameHistogram});

            const result = await getReviewHistogram(1245620);

            expect(axios.get).toHaveBeenCalledWith(`https://store.steampowered.com/appreviewhistogram/${1245620}?l=english`);
            expect(result).toEqual(expectedData);
        });
        it('should handle errors and return null', async() => {
            axios.get.mockRejectedValue(new Error('API error'));

            const result = await getReviewHistogram(1245620);

            expect(result).toEqual(null);
        });
    });
    describe('calculateReviewScore', () => {
        it('should take a review hisogram and return a review score', () => {
            const mockGameHistogram = JSON.parse(fs.readFileSync('src/tests/unit/backend/testEldenRingReviews.json', 'utf8'));

            const result = calculateReviewScore(mockGameHistogram.results);

            expect(result).toEqual(88.10);
        })
        it('should return 0 if there are not review', () => {
            const mockReviewData = {recent: []};
            const mockGameHistogram = {"success" : 1, "results" : {"recent" : []}};

            const result = calculateReviewScore(mockGameHistogram.results);

            expect(result).toEqual(0)
        })
    });
});
