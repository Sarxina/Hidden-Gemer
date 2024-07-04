const {getOneMonthAgoTimestamp, getAllGames, getGameDetails, getReviewHistogram, calculateReviewScore, getPlayerCount} = require('../../../backend/steamServiceUtils')

jest.mock('axios');
const axios = require('axios');

describe('steamServiceUtils', () => {
    describe('getOneMonthAgoTimestamp', () => {
        it('should get todays timestamp', () => {
            const date = new Date();
            date.setMonth(date.getMonth() - 1);
            const expectedResult = Math.floor(date.getTime() / 1000);

            const result = getOneMonthAgoTimestamp();

            expect(result).toEqual(expectedResult);
        });
    });
    describe('getAllGames', () => {
        it('should get 500 recent games from the steam api', async () => {
            try {
                console.log('Starting test for getAllGames');
                const result = await getAllGames();
                console.log('Test completed for getAllGames');
                console.log(`Fetched ${result.length} games`);
                expect(result.length).toBe(500);
            } catch (error) {
                console.error('Error in test:', error);
                throw error;
            }
        });
        it('this is just to see if I can call a api from a test', async () => {
            const response = await axios.get('https://randomuser.me/api/');
        })
    });
});
