import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/errors';
import request from 'supertest';
import { User, Project, Status } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/statuses';

describe('Status Create', () => {
  describe(`POST ${apiRoute}`, () => {
    let authenticatedUser: User;
    let authToken: string;
    let nonMember: User;
    let nonMemberAuthToken: string;
    let nonManager: User;
    let nonManagerAuthToken: string;
    let testProject: Project;
    let inactiveProject: Project;
    let existingStatus: Status;
    let payload: {
      name: unknown;
    };

    beforeAll(async () => {
      authenticatedUser = await testHelper.createTestUser();
      authToken = testHelper.generateToken(authenticatedUser);

      nonMember = await testHelper.createTestUser();
      nonMemberAuthToken = testHelper.generateToken(nonMember);

      nonManager = await testHelper.createTestUser();
      nonManagerAuthToken = testHelper.generateToken(nonManager);

      testProject = await testHelper.createTestProject(authenticatedUser);
      await testProject.createMembership({
        userId: nonManager.id,
        createdBy: authenticatedUser.id,
      });
      existingStatus = await testProject.createStatus({ name: 'ExistingStatus' });

      inactiveProject = await testHelper.createTestProject(authenticatedUser);
      inactiveProject.isActive = false;
      await inactiveProject.save();
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}/statuses`;
      payload = {
        name: 'Test-Status',
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
      apiRoute = '/projects/somethingInvalid/statuses';
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
      apiRoute = `/projects/${testHelper.generateUUID()}/statuses`;
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
      apiRoute = `/projects/${inactiveProject.id}/statuses`;
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested project not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests when the authenticated user is not a project member', (done) => {
      request(serverUrl).post(apiRoute).set('x-auth-token', nonMemberAuthToken).expect(
        401,
        {
          error: 'you do not have permission to create statuses for this project',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should reject requests when the authenticated user is not a project manager', (done) => {
      request(serverUrl).post(apiRoute).set('x-auth-token', nonManagerAuthToken).expect(
        401,
        {
          error: 'you do not have permission to create statuses for this project',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should reject requests when a project has 100 statuses', (done) => {
      const bulkStatuses = Array(100)
        .fill(1)
        .map((_, index) => ({
          name: `Status ${index}`,
          projectId: testProject.id,
        }));

      Status.bulkCreate(bulkStatuses).then((createdStatuses) => {
        request(serverUrl)
          .post(apiRoute)
          .set('x-auth-token', authToken)
          .send(payload)
          .expect(400)
          .end(async (err, res) => {
            if (err) {
              return done(err);
            }
            const { error, errorType } = res.body;
            expect(error).toBe('project has exceeded status limit of 100');
            expect(errorType).toEqual(ErrorTypes.VALIDATION);

            await Status.destroy({
              where: { id: createdStatuses.map((status) => status.id) },
            });
            done();
          });
      });
    });

    it('should reject requests when name is missing', (done) => {
      payload.name = undefined;
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
      payload.name = 1231231;
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
      payload.name = existingStatus.name;
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

    it('should successfully create a status', (done) => {
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
          const createdStatus = await testProject.getStatus({
            where: { name: payload.name },
          });
          if (!createdStatus) {
            return done('created status was not found in database');
          }

          expect(message).toBe('status has been successfully created');
          expect(status).toEqual({
            id: createdStatus.id,
            name: payload.name,
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
