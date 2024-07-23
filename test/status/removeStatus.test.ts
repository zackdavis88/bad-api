import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/errors';
import request from 'supertest';
import { User, Project, Status } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/statuses/:statusId';

describe('Status Remove', () => {
  describe(`DELETE ${apiRoute}`, () => {
    let authenticatedUser: User;
    let authToken: string;
    let testProject: Project;
    let inactiveProject: Project;
    let testStatus: Status;
    let nonManagerAuthToken: string;
    let nonMemberAuthToken: string;
    let payload: {
      confirm: unknown;
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
      testStatus = await testProject.createStatus({ name: 'TestStatus' });

      inactiveProject = await testHelper.createTestProject(authenticatedUser);
      inactiveProject.isActive = false;
      await inactiveProject.save();
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}/statuses/${testStatus.id}`;
      payload = {
        confirm: true,
      };
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

    it('should reject requests when projectId is not a valid UUID', (done) => {
      apiRoute = `/projects/somethingInvalid/statuses/${testStatus.id}`;
      request(serverUrl).delete(apiRoute).set('x-auth-token', authToken).expect(
        400,
        {
          error: 'requested project id is not valid',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when the requested project does not exist', (done) => {
      apiRoute = `/projects/${testHelper.generateUUID()}/statuses/${testStatus.id}`;
      request(serverUrl).delete(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested project not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests when the requested project is not active', (done) => {
      apiRoute = `/projects/${inactiveProject.id}/statuses/${testStatus.id}`;
      request(serverUrl).delete(apiRoute).set('x-auth-token', authToken).expect(
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
      request(serverUrl).delete(apiRoute).set('x-auth-token', authToken).expect(
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
      request(serverUrl).delete(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested status not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests when the authenticated user is not a project member', (done) => {
      request(serverUrl).delete(apiRoute).set('x-auth-token', nonMemberAuthToken).expect(
        401,
        {
          error: 'you do not have permission to remove statuses for this project',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should reject requests when the authenticated user is not a project manager', (done) => {
      request(serverUrl).delete(apiRoute).set('x-auth-token', nonManagerAuthToken).expect(
        401,
        {
          error: 'you do not have permission to remove statuses for this project',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should reject requests when confirm is missing', (done) => {
      payload.confirm = undefined;
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'confirm is missing from input',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when confirm is not a boolean', (done) => {
      payload.confirm = 'do eet!';
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'confirm input must be a boolean',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when confirm is not true', (done) => {
      payload.confirm = false;
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'confirm input must have a value of true',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should successfully remove a status', (done) => {
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const { message, status } = res.body;
          expect(message).toBe('status has been successfully removed');
          expect(status).toEqual({
            id: testStatus.id,
            name: testStatus.name,
            project: {
              id: testProject.id,
              name: testProject.name,
            },
          });

          // Ensure the status was actually deleted.
          const deletedStatus = await testProject.getStatus({
            where: { id: testStatus.id },
          });
          if (deletedStatus !== null) {
            return done('status was not deleted');
          }
          done();
        });
    });
  });
});
