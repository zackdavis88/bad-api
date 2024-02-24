import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/errors';
import request from 'supertest';
import { User, Project } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId';

describe('Project Update', () => {
  describe(`POST ${apiRoute}`, () => {
    let authenticatedUser: User;
    let testProject: Project;
    let inactiveProject: Project;
    let authToken: string;
    let nonMemberAuthToken: string;
    let memberWithoutPermissionAuthToken: string;
    let payload: {
      name: unknown;
      description: unknown;
    };

    beforeAll(async () => {
      authenticatedUser = await testHelper.createTestUser();
      const nonMember = await testHelper.createTestUser();
      const memberWithoutUpdatePermissions = await testHelper.createTestUser();

      testProject = await testHelper.createTestProject(
        authenticatedUser,
        'unit test project',
        'this project was generated via automated testing.',
      );

      inactiveProject = await testHelper.createTestProject(authenticatedUser);
      inactiveProject.deletedOn = new Date();
      inactiveProject.deletedById = authenticatedUser.id;
      inactiveProject.isActive = false;
      await inactiveProject.save();

      authToken = testHelper.generateToken(authenticatedUser);
      nonMemberAuthToken = testHelper.generateToken(nonMember);
      memberWithoutPermissionAuthToken = testHelper.generateToken(
        memberWithoutUpdatePermissions,
      );
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}`;
      payload = {
        name: 'Updated Test Project',
        description: 'This project was updated via automated testing.',
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
      apiRoute = '/projects/wrong';
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
      apiRoute = `/projects/${testHelper.generateUUID()}`;
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
      apiRoute = `/projects/${inactiveProject.id}`;
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested project not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests from non-members', (done) => {
      request(serverUrl).post(apiRoute).set('x-auth-token', nonMemberAuthToken).expect(
        401,
        {
          error: 'you do not have permission to update this project',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should reject requests from members without update permissions', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', memberWithoutPermissionAuthToken)
        .expect(
          401,
          {
            error: 'you do not have permission to update this project',
            errorType: ErrorTypes.AUTHORIZATION,
          },
          done,
        );
    });

    it('should reject requests that do not contain update data', (done) => {
      request(serverUrl).post(apiRoute).set('x-auth-token', authToken).expect(
        400,
        {
          error: 'input contains no update data',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when name is not a string', (done) => {
      payload.name = 1234;
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

    it('should reject requests when name is less than 3 characters', (done) => {
      payload.name = '';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'name must be 3 - 30 characters in length',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when name is more than 30 characters', (done) => {
      payload.name = Array(31).fill('a').join('');
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'name must be 3 - 30 characters in length',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when name contains invalid characters', (done) => {
      payload.name = 'Good Project 👍';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'name contains invalid characters',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when description is not a string', (done) => {
      payload = { name: undefined, description: false };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'description must be a string',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when description is more than 350 characters', (done) => {
      payload.description = Array(351).fill('a').join('');
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'description must be 350 characters or less',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should successfully update a project', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, project } = res.body;
          expect(message).toBe('project has been successfully updated');
          expect(project).toBeTruthy();
          expect(project.id).toBe(testProject.id);
          expect(project.name).toBe(payload.name);
          expect(project.description).toBe(payload.description);

          expect(project.createdOn).toBe(testProject.createdOn.toISOString());
          expect(project.createdBy).toBeTruthy();
          expect(project.createdBy.username).toBe(authenticatedUser.username);
          expect(project.createdBy.displayName).toBe(authenticatedUser.displayName);

          expect(project.updatedOn).toBeTruthy();
          expect(project.updatedBy).toBeTruthy();
          expect(project.updatedBy.username).toBe(authenticatedUser.username);
          expect(project.updatedBy.displayName).toBe(authenticatedUser.displayName);

          done();
        });
    });

    it('should successfully set a description to null if it is explicitly passed', (done) => {
      payload.description = null;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, project } = res.body;
          expect(message).toBe('project has been successfully updated');
          expect(project).toBeTruthy();
          expect(project.id).toBe(testProject.id);
          expect(project.name).toBe(payload.name);
          expect(project.description).toBe(null);
          done();
        });
    });
  });
});
