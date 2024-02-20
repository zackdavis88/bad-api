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
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
        400,
        {
          error: 'newPassword is missing from input',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when newPassword is not a string', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send({ newPassword: 1232133 })
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
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send({ newPassword: 'abc' })
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
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send({ newPassword: 'password1' })
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
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send({ newPassword: 'PASSWORD1' })
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
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send({ newPassword: 'PasswordOne' })
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
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send({ newPassword: 'SomethingNew48' })
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
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send({ newPassword: 'SomethingNew48', currentPassword: false })
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
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send({ newPassword: 'SomethingNew48', currentPassword: 'Password2' })
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
      const newPassword = 'SomethingNew48';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send({ newPassword, currentPassword: 'Password1' })
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const { message, user } = res.body;
          expect(message).toBe('user has been successfully updated');
          expect(user).toBeTruthy();
          expect(user.username).toBe(authenticatedUser.username);
          expect(user.displayName).toBe(authenticatedUser.displayName);
          expect(user.createdOn).toBe(authenticatedUser.createdOn.toISOString());

          // Ensure the password is actually updated.
          const updatedAuthenticatedUser = await User.findOne({
            where: { id: authenticatedUser.id },
          });
          expect(user.updatedOn).toBe(updatedAuthenticatedUser?.updatedOn?.toISOString()); // updatedOn in the response should match this user's updatedOn value.
          expect(updatedAuthenticatedUser?.compareHash(newPassword)).toBe(true); // compareHash should return true for the new password value.
          done();
        });
    });
  });
});
