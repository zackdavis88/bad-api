import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/errors';
import request from 'supertest';
import { User, Project, Status } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/statuses';

describe('Status GetAll', () => {
  describe(`GET ${apiRoute}`, () => {
    let authenticatedUser: User;
    let authToken: string;
    let testProject: Project;
    let inactiveProject: Project;
    let existingStatus1: Status;
    let existingStatus2: Status;
    let existingStatus3: Status;
    let existingStatus4: Status;

    beforeAll(async () => {
      authenticatedUser = await testHelper.createTestUser();
      authToken = testHelper.generateToken(authenticatedUser);

      testProject = await testHelper.createTestProject(authenticatedUser);
      await testProject.createStatus({ name: 'TestStatus1' });
      await testProject.createStatus({ name: 'TestStatus2' });
      await testProject.createStatus({ name: 'TestStatus3' });
      await testProject.createStatus({ name: 'TestStatus4' });
      await testProject.createStatus({ name: 'TestStatus5' });
      existingStatus1 = await testProject.createStatus({ name: 'TestStatus6' });
      existingStatus2 = await testProject.createStatus({ name: 'TestStatus7' });
      existingStatus3 = await testProject.createStatus({ name: 'TestStatus8' });
      existingStatus4 = await testProject.createStatus({ name: 'TestStatus9' });

      inactiveProject = await testHelper.createTestProject(authenticatedUser);
      inactiveProject.isActive = false;
      await inactiveProject.save();
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}/statuses`;
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
      apiRoute = '/projects/somethingInvalid/statuses';
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
      apiRoute = `/projects/${testHelper.generateUUID()}/statuses`;
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
      apiRoute = `/projects/${inactiveProject.id}/statuses`;
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested project not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should successfully return a list of statuses for a project', (done) => {
      request(serverUrl)
        .get(`${apiRoute}?page=2&itemsPerPage=5`)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, project, statuses, ...paginationData } = res.body;
          expect(message).toBe('status list has been successfully retrieved');
          expect(project).toEqual({
            id: testProject.id,
            name: testProject.name,
          });
          expect(paginationData).toEqual({
            page: 2,
            totalItems: 9,
            itemsPerPage: 5,
            totalPages: 2,
          });
          expect(statuses).toEqual([
            {
              id: existingStatus1.id,
              name: existingStatus1.name,
            },
            {
              id: existingStatus2.id,
              name: existingStatus2.name,
            },
            {
              id: existingStatus3.id,
              name: existingStatus3.name,
            },
            {
              id: existingStatus4.id,
              name: existingStatus4.name,
            },
          ]);
          done();
        });
    });
  });
});
