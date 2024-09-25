import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/errors';
import request from 'supertest';
import { User, Project } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/permissions';

describe('Project GetProjectPermissions', () => {
  describe(`GET ${apiRoute}`, () => {
    let testProject: Project;
    let inactiveProject: Project;

    let adminUser: User;
    let managerUser: User;
    let developerUser: User;
    let viewerUser: User;
    let nonMemberUser: User;

    let adminAuthToken: string;
    let managerAuthToken: string;
    let developerAuthToken: string;
    let viewerAuthToken: string;
    let nonMemberAuthToken: string;

    beforeAll(async () => {
      adminUser = await testHelper.createTestUser();
      managerUser = await testHelper.createTestUser();
      developerUser = await testHelper.createTestUser();
      viewerUser = await testHelper.createTestUser();
      nonMemberUser = await testHelper.createTestUser();

      testProject = await testHelper.createTestProject(
        adminUser,
        'unit test project',
        'this project was generated via automated testing.',
      );

      await testProject.createMembership({
        userId: managerUser.id,
        isProjectManager: true,
        createdById: adminUser.id,
      });

      await testProject.createMembership({
        userId: developerUser.id,
        isProjectDeveloper: true,
        createdById: adminUser.id,
      });

      await testProject.createMembership({
        userId: viewerUser.id,
        createdById: adminUser.id,
      });

      inactiveProject = await testHelper.createTestProject(adminUser);
      inactiveProject.deletedOn = new Date();
      inactiveProject.deletedById = adminUser.id;
      inactiveProject.isActive = false;
      await inactiveProject.save();

      adminAuthToken = testHelper.generateToken(adminUser);
      managerAuthToken = testHelper.generateToken(managerUser);
      developerAuthToken = testHelper.generateToken(developerUser);
      viewerAuthToken = testHelper.generateToken(viewerUser);
      nonMemberAuthToken = testHelper.generateToken(nonMemberUser);
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}/permissions`;
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
      apiRoute = '/projects/somethingInvalid/permissions';
      request(serverUrl).get(apiRoute).set('x-auth-token', adminAuthToken).expect(
        400,
        {
          error: 'requested project id is not valid',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when the requested project does not exist', (done) => {
      apiRoute = `/projects/${testHelper.generateUUID()}/permissions`;
      request(serverUrl).get(apiRoute).set('x-auth-token', adminAuthToken).expect(
        404,
        {
          error: 'requested project not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests when the requested project is not active', (done) => {
      apiRoute = `/projects/${inactiveProject.id}/permissions`;
      request(serverUrl).get(apiRoute).set('x-auth-token', adminAuthToken).expect(
        404,
        {
          error: 'requested project not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should successfully return admin permissions', (done) => {
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-token', adminAuthToken)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, permissions } = res.body;
          expect(message).toBe('project permissions successfully retrieved');
          expect(permissions).toEqual({
            canRemoveProject: true,
            canUpdateProject: true,
            canCreateAdminMembership: true,
            canCreateMembership: true,
            canUpdateAdminMembership: true,
            canUpdateMembership: true,
            canRemoveAdminMembership: true,
            canRemoveMembership: true,
            canCreateStatus: true,
            canUpdateStatus: true,
            canRemoveStatus: true,
            canCreateStory: true,
            canUpdateStory: true,
            canRemoveStory: true,
            canReadStory: true,
          });
          done();
        });
    });

    it('should successfully return manager permissions', (done) => {
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-token', managerAuthToken)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, permissions } = res.body;
          expect(message).toBe('project permissions successfully retrieved');
          expect(permissions).toEqual({
            canRemoveProject: false,
            canUpdateProject: true,
            canCreateAdminMembership: false,
            canCreateMembership: true,
            canUpdateAdminMembership: false,
            canUpdateMembership: true,
            canRemoveAdminMembership: false,
            canRemoveMembership: true,
            canCreateStatus: true,
            canUpdateStatus: true,
            canRemoveStatus: true,
            canCreateStory: true,
            canUpdateStory: true,
            canRemoveStory: true,
            canReadStory: true,
          });
          done();
        });
    });

    it('should successfully return developer permissions', (done) => {
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-token', developerAuthToken)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, permissions } = res.body;
          expect(message).toBe('project permissions successfully retrieved');
          expect(permissions).toEqual({
            canRemoveProject: false,
            canUpdateProject: false,
            canCreateAdminMembership: false,
            canCreateMembership: false,
            canUpdateAdminMembership: false,
            canUpdateMembership: false,
            canRemoveAdminMembership: false,
            canRemoveMembership: false,
            canCreateStatus: false,
            canUpdateStatus: false,
            canRemoveStatus: false,
            canCreateStory: true,
            canUpdateStory: true,
            canRemoveStory: true,
            canReadStory: true,
          });
          done();
        });
    });

    it('should successfully return viewer permissions', (done) => {
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-token', viewerAuthToken)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, permissions } = res.body;
          expect(message).toBe('project permissions successfully retrieved');
          expect(permissions).toEqual({
            canRemoveProject: false,
            canUpdateProject: false,
            canCreateAdminMembership: false,
            canCreateMembership: false,
            canUpdateAdminMembership: false,
            canUpdateMembership: false,
            canRemoveAdminMembership: false,
            canRemoveMembership: false,
            canCreateStatus: false,
            canUpdateStatus: false,
            canRemoveStatus: false,
            canCreateStory: false,
            canUpdateStory: false,
            canRemoveStory: false,
            canReadStory: true,
          });
          done();
        });
    });

    it('should successfully return non-member permissions', (done) => {
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-token', nonMemberAuthToken)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, permissions } = res.body;
          expect(message).toBe('project permissions successfully retrieved');
          expect(permissions).toEqual({
            canRemoveProject: false,
            canUpdateProject: false,
            canCreateAdminMembership: false,
            canCreateMembership: false,
            canUpdateAdminMembership: false,
            canUpdateMembership: false,
            canRemoveAdminMembership: false,
            canRemoveMembership: false,
            canCreateStatus: false,
            canUpdateStatus: false,
            canRemoveStatus: false,
            canCreateStory: false,
            canUpdateStory: false,
            canRemoveStory: false,
            canReadStory: false,
          });
          done();
        });
    });
  });
});
