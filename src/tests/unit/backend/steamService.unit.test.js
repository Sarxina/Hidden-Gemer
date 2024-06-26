// require all the functions in steamService.js
const steamService = require('../../../backend/steamService');
const axios = require('axios')

require('dotenv').config();



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
        it('should be able to perform a get request to steam and get a valid response', async () => {
            const response = await axios.get()
        });
    })
});
