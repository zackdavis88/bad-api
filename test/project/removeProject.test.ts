import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/errors';
import request from 'supertest';
import { User, Project } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId';

describe('Project Remove', () => {
  describe(`DELETE ${apiRoute}`, () => {
    let authenticatedUser: User;
    let testProject: Project;
    let inactiveProject: Project;
    let authToken: string;
    let nonMemberAuthToken: string;
    let memberWithoutPermissionAuthToken: string;
    let payload: {
      confirm: unknown;
    };

    beforeAll(async () => {
      authenticatedUser = await testHelper.createTestUser();
      const nonMember = await testHelper.createTestUser();
      const memberWithoutRemovePermissions = await testHelper.createTestUser();

      testProject = await testHelper.createTestProject(
        authenticatedUser,
        'unit test project',
        'this project was generated via automated testing.',
      );

      await testProject.createMembership({
        userId: memberWithoutRemovePermissions.id,
        createdById: authenticatedUser.id,
        isProjectManager: true,
      });

      inactiveProject = await testHelper.createTestProject(authenticatedUser);
      inactiveProject.deletedOn = new Date();
      inactiveProject.deletedById = authenticatedUser.id;
      inactiveProject.isActive = false;
      await inactiveProject.save();

      authToken = testHelper.generateToken(authenticatedUser);
      nonMemberAuthToken = testHelper.generateToken(nonMember);
      memberWithoutPermissionAuthToken = testHelper.generateToken(
        memberWithoutRemovePermissions,
      );
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}`;
      payload = {
        confirm: testProject.name,
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
      apiRoute = '/projects/something';
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
      apiRoute = `/projects/${testHelper.generateUUID()}`;
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
      apiRoute = `/projects/${inactiveProject.id}`;
      request(serverUrl).delete(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested project not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests from non-members', (done) => {
      request(serverUrl).delete(apiRoute).set('x-auth-token', nonMemberAuthToken).expect(
        401,
        {
          error: 'you do not have permission to remove this project',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should reject requests from members without remove permissions', (done) => {
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', memberWithoutPermissionAuthToken)
        .expect(
          401,
          {
            error: 'you do not have permission to remove this project',
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

    it('should reject requests when confirm is not a string', (done) => {
      payload.confirm = true;
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
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
      payload.confirm = 'this should be the project name';
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: `confirm input must have a value of ${testProject.name}`,
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should successfully remove a project', (done) => {
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const { message, project } = res.body;
          expect(message).toBe('project has been successfully removed');
          expect(project).toBeTruthy();
          expect(project.id).toBe(testProject.id);
          expect(project.name).toBe(testProject.name);
          expect(project.description).toBe(testProject.description);

          expect(project.createdOn).toBe(testProject.createdOn.toISOString());
          expect(project.createdBy).toBeTruthy();
          expect(project.createdBy).toEqual({
            username: authenticatedUser.username,
            displayName: authenticatedUser.displayName,
          });

          expect(project.updatedOn).toBeFalsy();
          expect(project.updatedBy).toEqual({
            username: null,
            displayName: null,
          });

          expect(project.deletedOn).toBeTruthy();
          expect(project.deletedBy).toEqual({
            username: authenticatedUser.username,
            displayName: authenticatedUser.displayName,
          });

          // Ensure the user is actually removed.
          const removedTestProject = await Project.findOne({
            where: { id: testProject.id },
          });
          expect(project.deletedOn).toBe(removedTestProject?.deletedOn?.toISOString());
          expect(removedTestProject?.isActive).toBe(false);
          done();
        });
    });
  });
});
