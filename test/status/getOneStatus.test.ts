import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/errors';
import request from 'supertest';
import { User, Project, Status } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/statuses/:statusId';

describe('Status GetOne', () => {
  describe(`GET ${apiRoute}`, () => {
    let authenticatedUser: User;
    let authToken: string;
    let testProject: Project;
    let inactiveProject: Project;
    let testStatus: Status;

    beforeAll(async () => {
      authenticatedUser = await testHelper.createTestUser();
      authToken = testHelper.generateToken(authenticatedUser);

      testProject = await testHelper.createTestProject(authenticatedUser);
      testStatus = await testProject.createStatus({ name: 'TestStatus!!' });

      inactiveProject = await testHelper.createTestProject(authenticatedUser);
      inactiveProject.isActive = false;
      await inactiveProject.save();
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}/statuses/${testStatus.id}`;
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

    it('should reject requests when projectId is not a valid UUID', (done) => {
      apiRoute = `/projects/somethingInvalid/statuses/${testStatus.id}`;
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
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
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
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
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested project not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests when statusId is not a valid UUID', (done) => {
      apiRoute = `/projects/${testProject.id}/statuses/notValid`;
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
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
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested status not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should successfully retrieve status details', (done) => {
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, status } = res.body;
          expect(message).toBe('status has been successfully retrieved');
          expect(status).toEqual({
            id: testStatus.id,
            name: testStatus.name,
            project: {
              id: testProject.id,
              name: testProject.name,
            },
          });
          done();
        });
    });
  });
});
