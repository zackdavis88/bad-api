import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/errors';
import { User } from '../../src/models';
import request from 'supertest';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/users/:username';

describe('User GetOne', () => {
  describe(`GET ${apiRoute}`, () => {
    let authenticatedUser: User;
    let authToken: string;
    let testUser: User;

    beforeAll(async () => {
      authenticatedUser = await testHelper.createTestUser();
      testUser = await testHelper.createTestUser();
      authToken = testHelper.generateToken(authenticatedUser);
    });

    beforeEach(() => {
      apiRoute = `/users/${testUser.displayName}`;
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

    it('should reject requests when the requested user is not found', (done) => {
      apiRoute = '/users/u$erdoesntexist';
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested user not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should successfully retrieve user details', (done) => {
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, user } = res.body;
          expect(message).toBe('user has been successfully retrieved');
          expect(user).toBeTruthy();
          expect(user.username).toBe(testUser.username);
          expect(user.displayName).toBe(testUser.displayName);
          expect(user.createdOn).toBe(testUser.createdOn.toISOString());
          done();
        });
    });
  });
});
