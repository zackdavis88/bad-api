import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/errors';
import { User } from '../../src/models';
import request from 'supertest';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
const apiRoute = '/users';

describe('User GetAll', () => {
  describe(`GET ${apiRoute}`, () => {
    let userList: User[];
    let authToken: string;

    beforeAll(async () => {
      const authenticatedUser = await testHelper.createTestUser('Password1');
      userList = [authenticatedUser].concat(
        await testHelper.createTestUser('Password2'),
        await testHelper.createTestUser('Password3'),
        await testHelper.createTestUser('Password4'),
        await testHelper.createTestUser('Password5'),
        await testHelper.createTestUser('Password6'),
        await testHelper.createTestUser('Password7'),
        await testHelper.createTestUser('Password8'),
        await testHelper.createTestUser('Password9'),
        await testHelper.createTestUser('Password10'),
      );

      // Making an inactiveUser to ensure they are not included on the count.
      const inactiveUser = await testHelper.createTestUser();
      inactiveUser.isActive = false;
      inactiveUser.deletedOn = new Date();
      await inactiveUser.save();

      authToken = testHelper.generateToken(authenticatedUser);
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

          const { message, ...userListData } = res.body;
          expect(message).toBe('user list has been successfully retrieved');
          expect(userListData).toEqual({
            page: 1,
            itemsPerPage: 10,
            totalPages: 1,
            totalItems: 10,
            users: userList.map((user) => ({
              username: user.username,
              displayName: user.displayName,
              createdOn: user.createdOn.toISOString(),
            })),
          });
          done();
        });
    });
  });
});
