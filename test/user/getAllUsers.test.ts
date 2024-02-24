import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/errors';
import { User } from '../../src/models';
import request from 'supertest';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
const apiRoute = '/users';

describe('User GetAll', () => {
  describe(`GET ${apiRoute}`, () => {
    let testUser: User;
    let authToken: string;

    beforeAll(async () => {
      testUser = await testHelper.createTestUser('Password1');
      await testHelper.createTestUser('Password2');
      await testHelper.createTestUser('Password3');
      await testHelper.createTestUser('Password4');
      await testHelper.createTestUser('Password5');
      await testHelper.createTestUser('Password6');
      await testHelper.createTestUser('Password7');
      await testHelper.createTestUser('Password8');
      await testHelper.createTestUser('Password9');
      await testHelper.createTestUser('Password10');
      authToken = testHelper.generateToken(testUser);

      const inactiveUser = await testHelper.createTestUser();
      inactiveUser.isActive = false;
      inactiveUser.deletedOn = new Date();
      await inactiveUser.save();
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    it('should reject requests when x-auth-token is missing', (done) => {
      request(serverUrl).get(apiRoute).expect(
        400,
        {
          error: 'x-auth-token header is missing from input',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should successfully return a list of users', (done) => {
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, users, page, itemsPerPage, totalPages, totalItems } = res.body;
          expect(message).toBe('user list has been successfully retrieved');
          expect(page).toBe(1);
          expect(itemsPerPage).toBe(10);
          expect(totalPages).toBe(1);
          expect(totalItems).toBe(10);
          expect(users).toBeTruthy();
          expect(users.length).toBe(10);
          const user = users[0];
          expect(user.username).toBeTruthy();
          expect(user.displayName).toBeTruthy();
          expect(user.createdOn).toBeTruthy();
          expect(!user.id).toBeTruthy();
          expect(!user.hash).toBeTruthy();
          expect(!user.apiKey).toBeTruthy();
          done();
        });
    });
  });
});
