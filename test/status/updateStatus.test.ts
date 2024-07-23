import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/errors';
import request from 'supertest';
import { User, Project, Status } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/statuses/:statusId';

describe('Status Update', () => {
  describe(`POST ${apiRoute}`, () => {
    let authenticatedUser: User;
    let authToken: string;
    let testProject: Project;
    let inactiveProject: Project;
    let testStatus1: Status;
    let testStatus2: Status;
    let nonManagerAuthToken: string;
    let nonMemberAuthToken: string;
    let payload: {
      name: unknown;
    };

    beforeAll(async () => {
      authenticatedUser = await testHelper.createTestUser();
      authToken = testHelper.generateToken(authenticatedUser);

      const nonManager = await testHelper.createTestUser();
      nonManagerAuthToken = testHelper.generateToken(nonManager);

      const nonMember = await testHelper.createTestUser();
      nonMemberAuthToken = testHelper.generateToken(nonMember);

      testProject = await testHelper.createTestProject(authenticatedUser);
      await testProject.createMembership({
        userId: nonManager.id,
        createdById: authenticatedUser.id,
      });
      testStatus1 = await testProject.createStatus({ name: 'TestStatus1' });
      testStatus2 = await testProject.createStatus({ name: 'TestStatus2' });

      inactiveProject = await testHelper.createTestProject(authenticatedUser);
      inactiveProject.isActive = false;
      await inactiveProject.save();
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}/statuses/${testStatus1.id}`;
      payload = {
        name: 'TestStatus - Updated',
      };
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

    it('should reject requests when projectId is not a valid UUID', (done) => {
      apiRoute = `/projects/somethingInvalid/statuses/${testStatus1.id}`;
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
        400,
        {
          error: 'requested project id is not valid',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when the requested project does not exist', (done) => {
      apiRoute = `/projects/${testHelper.generateUUID()}/statuses/${testStatus2.id}`;
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested project not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests when the requested project is not active', (done) => {
      apiRoute = `/projects/${inactiveProject.id}/statuses/${testStatus1.id}`;
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested project not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests when statusId is not a valid UUID', (done) => {
      apiRoute = `/projects/${testProject.id}/statuses/SomethingWrongLol`;
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
        400,
        {
          error: 'requested status id is not valid',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when the requested status does not exist', (done) => {
      apiRoute = `/projects/${testProject.id}/statuses/${testHelper.generateUUID()}`;
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested status not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests when the authenticated user is not a project member', (done) => {
      request(serverUrl).post(apiRoute).set('x-auth-token', nonMemberAuthToken).expect(
        401,
        {
          error: 'you do not have permission to update statuses for this project',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should reject requests when the authenticated user is not a project manager', (done) => {
      request(serverUrl).post(apiRoute).set('x-auth-token', nonManagerAuthToken).expect(
        401,
        {
          error: 'you do not have permission to update statuses for this project',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should reject requests when name is missing', (done) => {
      payload.name = null;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'name is missing from input',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when name is not a string', (done) => {
      payload.name = true;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'name must be a string',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when name is less than 1 character', (done) => {
      payload.name = '';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'name must be 1 - 50 characters in length',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when name is more than 50 character', (done) => {
      payload.name = Array(51).fill('a').join('');
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'name must be 1 - 50 characters in length',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when the status already exists', (done) => {
      payload.name = testStatus2.name;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'status already exists',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should successfully update a status', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const { message, status } = res.body;
          expect(message).toBe('status has been successfully updated');
          expect(status).toEqual({
            id: testStatus1.id,
            name: payload.name,
            project: {
              id: testProject.id,
              name: testProject.name,
            },
          });

          // Ensure the name was actually updated in the database.
          const updatedStatus = await testProject.getStatus({
            where: { id: testStatus1.id },
          });
          if (!updatedStatus) {
            return done('updated status was not found in database');
          }

          expect(updatedStatus.name).toBe(payload.name);
          done();
        });
    });
  });
});
