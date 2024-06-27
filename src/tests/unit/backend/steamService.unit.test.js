// require all the functions in steamService.js
const steamService = require('../../../backend/steamService');
const axios = require('axios')

require('dotenv').config();

const apiKey = process.env.STEAM_API_KEY;

describe('streamService', () => {
    describe('getOneMonthAgoTimestamp', ()=> {
        it('should get the date exactly one month ago', async () => {
            const result = steamService.getOneMonthAgoTimestamp();
            const date = new Date();
            date.setMonth(date.getMonth() - 1);
            const expected = Math.floor(date.getTime() / 1000);
            expect(result).toEqual(expected);
        });
    });
    describe('getAllGames', () => {
        it('should return the top 500 most recent ids', async () => {
            const mockGames = Array.from({ length: 600 }, (_, index) => ({ id: index, name: `Game ${index}` }));
            axios.get.mockResolvedValue({ data: mockGames})

            const result = await streamService.getAllGames();

            expect(result.legnth).toEqual(500)

            expect(result[0]).toHaveProperty('id')
            expect(result[0]).toHaveProperty('name')
        });
    })
});


