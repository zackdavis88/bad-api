import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/errors';
import { User } from '../../src/models';
import request from 'supertest';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/users/:username';

describe('User Remove', () => {
  describe(`DELETE ${apiRoute}`, () => {
    let authenticatedUser: User;
    let authToken: string;
    let testUser: User;

    beforeAll(async () => {
      authenticatedUser = await testHelper.createTestUser();
      testUser = await testHelper.createTestUser();
      authToken = testHelper.generateToken(authenticatedUser);
    });

    beforeEach(() => {
      apiRoute = `/users/${authenticatedUser.displayName}`;
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    it('should reject requests when x-auth-token is missing', (done) => {
      request(serverUrl).delete(apiRoute).expect(
        400,
        {
          error: 'x-auth-token header is missing from input',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when attempting to remove other users', (done) => {
      apiRoute = `/users/${testUser.username}`;
      request(serverUrl).delete(apiRoute).set('x-auth-token', authToken).expect(
        401,
        {
          error: 'you do not have permission to perform this action',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should reject requests when confirm is missing', (done) => {
      request(serverUrl).delete(apiRoute).set('x-auth-token', authToken).expect(
        400,
        {
          error: 'confirm is missing from input',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when confirm is not a string', (done) => {
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send({ confirm: true })
        .expect(
          400,
          {
            error: 'confirm input must be a string',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when confirm does not match the expected value', (done) => {
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send({ confirm: 'do it plz' })
        .expect(
          400,
          {
            error: `confirm input must have a value of ${authenticatedUser.username}`,
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should successfully remove a user', (done) => {
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send({ confirm: authenticatedUser.username })
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const { message, user } = res.body;
          expect(message).toBe('user has been successfully removed');
          expect(user).toBeTruthy();
          expect(user.username).toBe(authenticatedUser.username);
          expect(user.displayName).toBe(authenticatedUser.displayName);
          expect(user.createdOn).toBe(authenticatedUser.createdOn.toISOString());
          // Ensure the user is actually removed.
          const removedAuthenticatedUser = await User.findOne({
            where: { id: authenticatedUser.id },
          });
          expect(user.deletedOn).toBe(removedAuthenticatedUser?.deletedOn?.toISOString());
          expect(removedAuthenticatedUser?.isActive).toBe(false);
          done();
        });
    });
  });
});
