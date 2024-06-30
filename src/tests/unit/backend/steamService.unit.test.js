// steamService.unit.test.js

const axios = require('axios')

const {
    getFilteredGames,
} = require('../../../backend/steamService')

jest.mock('axios')

describe('steamService', () => {
    afterEach(() => {
        jset.clearAllMocks();
    });

    describe('getAllGames', () => {
        it('it should fetch and return all games, sorted by appid descending, limited to 500', async () => {
            const mockGames = Array.from({length: 600}, (_, i) => ({appid: i, name: `Game ${i}`}));
            axios.get.mockResolvedValue({
                data: { applist: { apps: mockGames}},
            });

            const result = await getAllGames();

            expect(axios.get).toHaveBeenCalledWith('https://api.steampowered.com/ISteamApps/GetAppList/v2/', { params: { key: process.env.STEAM_API_KEY } });
            expect(result).toHaveLength(500)
            expect(result[0].appid).tobe(599);
            expect(result[499].appid).toBe(100);

        })
    });
});
