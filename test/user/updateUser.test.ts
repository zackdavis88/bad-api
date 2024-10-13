import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/errors';
import { User } from '../../src/models';
import request from 'supertest';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/users/:username';

describe('User Update', () => {
  describe(`POST ${apiRoute}`, () => {
    let authenticatedUser: User;
    let authToken: string;
    let testUser: User;
    let payload: {
      newPassword: unknown;
      currentPassword: unknown;
    };

    beforeAll(async () => {
      authenticatedUser = await testHelper.createTestUser();
      testUser = await testHelper.createTestUser();
      authToken = testHelper.generateToken(authenticatedUser);
    });

    beforeEach(() => {
      apiRoute = `/users/${authenticatedUser.displayName}`;
      payload = {
        newPassword: 'SomethingNew48',
        currentPassword: 'Password1',
      };
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    it('should reject requests when x-auth-token is missing', (done) => {
      request(serverUrl).post(apiRoute).expect(
        400,
        {
          error: 'x-auth-token header is missing from input',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when attempting to update other users', (done) => {
      apiRoute = `/users/${testUser.username}`;
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
        401,
        {
          error: 'you do not have permission to perform this action',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should reject requests when newPassword is missing', (done) => {
      payload.newPassword = undefined;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'newPassword is missing from input',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when newPassword is not a string', (done) => {
      payload.newPassword = 1232133;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'newPassword must be a string',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when newPassword is less than 8 characters', (done) => {
      payload.newPassword = 'abc';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'newPassword must be at least 8 characters in length',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when newPassword has no uppercase characters', (done) => {
      payload.newPassword = 'password1';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'newPassword must have 1 uppercase, lowercase, and number character',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when newPassword has no lowercase characters', (done) => {
      payload.newPassword = 'PASSWORD1';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'newPassword must have 1 uppercase, lowercase, and number character',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when newPassword has no number characters', (done) => {
      payload.newPassword = 'PasswordOne';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'newPassword must have 1 uppercase, lowercase, and number character',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when currentPassword is missing', (done) => {
      payload.currentPassword = undefined;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'currentPassword is missing from input',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when currentPassword is not a string', (done) => {
      payload.currentPassword = false;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'currentPassword must be a string',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when currentPassword is not valid', (done) => {
      payload.currentPassword = 'Password2';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'currentPassword in invalid',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should successfully update a user password', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          // Ensure the password was actually updated.
          const updatedAuthenticatedUser = await User.findOne({
            where: { id: authenticatedUser.id, isActive: true },
          });
          if (!updatedAuthenticatedUser) {
            return done('updated user was not found in database');
          }

          const { message, user } = res.body;
          expect(message).toBe('user has been successfully updated');
          expect(user).toEqual({
            username: authenticatedUser.username,
            displayName: authenticatedUser.displayName,
            createdOn: authenticatedUser.createdOn.toISOString(),
            updatedOn: updatedAuthenticatedUser.updatedOn?.toISOString(),
          });

          // compareHash should return true for the new password value.
          expect(updatedAuthenticatedUser.compareHash(String(payload.newPassword))).toBe(
            true,
          );
          done();
        });
    });
  });
});
