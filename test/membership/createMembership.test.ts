import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/errors';
import request from 'supertest';
import { Project, User, Membership } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/memberships';

describe('Membership Create', () => {
  describe(`POST ${apiRoute}`, () => {
    let adminUser: User;
    let managerUser: User;
    let nonMemberUser: User;
    let testProject: Project;
    let inactiveProject: Project;
    let adminAuthToken: string;
    let managerAuthToken: string;
    let viewerAuthToken: string;
    let nonMemberAuthToken: string;
    let payload: {
      username: unknown;
      isProjectAdmin?: unknown;
      isProjectManager?: unknown;
    };

    beforeAll(async () => {
      adminUser = await testHelper.createTestUser();
      nonMemberUser = await testHelper.createTestUser();
      managerUser = await testHelper.createTestUser();
      const viewerUser = await testHelper.createTestUser();

      inactiveProject = await testHelper.createTestProject(adminUser);
      inactiveProject.isActive = false;
      await inactiveProject.save();

      testProject = await testHelper.createTestProject(adminUser);
      await testProject.createMembership({
        userId: managerUser.id,
        isProjectManager: true,
      });
      await testProject.createMembership({
        userId: viewerUser.id,
      });

      adminAuthToken = testHelper.generateToken(adminUser);
      managerAuthToken = testHelper.generateToken(managerUser);
      viewerAuthToken = testHelper.generateToken(viewerUser);
      nonMemberAuthToken = testHelper.generateToken(nonMemberUser);
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}/memberships`;
      payload = {
        username: nonMemberUser.username,
      };
    });

    afterEach(async () => {
      await Membership.destroy({ where: { userId: nonMemberUser.id } });
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
      apiRoute = '/projects/somethingInvalid/memberships';
      request(serverUrl).post(apiRoute).set('x-auth-token', adminAuthToken).expect(
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
      request(serverUrl).post(apiRoute).set('x-auth-token', adminAuthToken).expect(
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
      request(serverUrl).post(apiRoute).set('x-auth-token', adminAuthToken).expect(
        404,
        {
          error: 'requested project not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests when non-members try to create an admin membership', (done) => {
      payload = {
        username: nonMemberUser.username,
        isProjectAdmin: true,
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', nonMemberAuthToken)
        .send(payload)
        .expect(
          401,
          {
            error:
              'you do not have permission to create admin memberships for this project',
            errorType: ErrorTypes.AUTHORIZATION,
          },
          done,
        );
    });

    it('should reject requests when managers try to create an admin membership', (done) => {
      payload = {
        username: nonMemberUser.username,
        isProjectAdmin: true,
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', managerAuthToken)
        .send(payload)
        .expect(
          401,
          {
            error:
              'you do not have permission to create admin memberships for this project',
            errorType: ErrorTypes.AUTHORIZATION,
          },
          done,
        );
    });

    it('should reject requests when viewers try to create an admin membership', (done) => {
      payload = {
        username: nonMemberUser.username,
        isProjectAdmin: true,
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', viewerAuthToken)
        .send(payload)
        .expect(
          401,
          {
            error:
              'you do not have permission to create admin memberships for this project',
            errorType: ErrorTypes.AUTHORIZATION,
          },
          done,
        );
    });

    it('should reject requests when non-members try to create a manager membership', (done) => {
      payload = {
        username: nonMemberUser.username,
        isProjectManager: true,
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', nonMemberAuthToken)
        .send(payload)
        .expect(
          401,
          {
            error: 'you do not have permission to create memberships for this project',
            errorType: ErrorTypes.AUTHORIZATION,
          },
          done,
        );
    });

    it('should reject requests when viewers try to create a manager membership', (done) => {
      payload = {
        username: nonMemberUser.username,
        isProjectManager: true,
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', viewerAuthToken)
        .send(payload)
        .expect(
          401,
          {
            error: 'you do not have permission to create memberships for this project',
            errorType: ErrorTypes.AUTHORIZATION,
          },
          done,
        );
    });

    it('should reject requests when isProjectAdmin is present and not a boolean', (done) => {
      payload = {
        username: nonMemberUser.username,
        isProjectAdmin: 'true',
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', adminAuthToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'isProjectAdmin must be a boolean',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when isProjectManager is present and not a boolean', (done) => {
      payload = {
        username: nonMemberUser.username,
        isProjectManager: 1,
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', adminAuthToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'isProjectManager must be a boolean',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when username is missing', (done) => {
      payload = {
        username: undefined,
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', adminAuthToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'username is missing from input',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when username is not a string', (done) => {
      payload = {
        username: 123123,
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', adminAuthToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'username must be a string',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when the requested user does not exist', (done) => {
      payload = {
        username: 'doe$ntExist',
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', adminAuthToken)
        .send(payload)
        .expect(
          404,
          {
            error: 'requested user does not exist',
            errorType: ErrorTypes.NOT_FOUND,
          },
          done,
        );
    });

    it('should reject requests when a membership already exists for the requested user', (done) => {
      payload = {
        username: adminUser.username,
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', adminAuthToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'membership already exists for this user',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should allow admin members to create admin members', (done) => {
      payload = {
        username: nonMemberUser.username,
        isProjectAdmin: true,
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', adminAuthToken)
        .send(payload)
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const createdMembership = await Membership.findOne({
            where: { userId: nonMemberUser.id, projectId: testProject.id },
          });
          if (!createdMembership) {
            return done('created membership was not found in database');
          }

          const { message, membership } = res.body;
          expect(message).toBe('membership has been successfully created');
          expect(membership).toEqual({
            id: createdMembership.id,
            user: {
              username: nonMemberUser.username,
              displayName: nonMemberUser.displayName,
            },
            project: {
              id: testProject.id,
              name: testProject.name,
            },
            isProjectAdmin: true,
            isProjectManager: false,
            createdOn: createdMembership.createdOn.toISOString(),
            createdBy: {
              username: adminUser.username,
              displayName: adminUser.displayName,
            },
          });
          done();
        });
    });

    it('should allow admin members to create manager members', (done) => {
      payload = {
        username: nonMemberUser.username,
        isProjectManager: true,
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', adminAuthToken)
        .send(payload)
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const createdMembership = await Membership.findOne({
            where: { userId: nonMemberUser.id, projectId: testProject.id },
          });
          if (!createdMembership) {
            return done('created membership was not found in database');
          }

          const { message, membership } = res.body;
          expect(message).toBe('membership has been successfully created');
          expect(membership).toEqual({
            id: createdMembership.id,
            user: {
              username: nonMemberUser.username,
              displayName: nonMemberUser.displayName,
            },
            project: {
              id: testProject.id,
              name: testProject.name,
            },
            isProjectAdmin: false,
            isProjectManager: true,
            createdOn: createdMembership.createdOn.toISOString(),
            createdBy: {
              username: adminUser.username,
              displayName: adminUser.displayName,
            },
          });
          done();
        });
    });

    it('should allow admin members to create viewer members', (done) => {
      payload = {
        username: nonMemberUser.username,
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', adminAuthToken)
        .send(payload)
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const createdMembership = await Membership.findOne({
            where: { userId: nonMemberUser.id, projectId: testProject.id },
          });
          if (!createdMembership) {
            return done('created membership was not found in database');
          }

          const { message, membership } = res.body;
          expect(message).toBe('membership has been successfully created');
          expect(membership).toEqual({
            id: createdMembership.id,
            user: {
              username: nonMemberUser.username,
              displayName: nonMemberUser.displayName,
            },
            project: {
              id: testProject.id,
              name: testProject.name,
            },
            isProjectAdmin: false,
            isProjectManager: false,
            createdOn: createdMembership.createdOn.toISOString(),
            createdBy: {
              username: adminUser.username,
              displayName: adminUser.displayName,
            },
          });
          done();
        });
    });

    it('should allow manager members to create manager members', (done) => {
      payload = {
        username: nonMemberUser.username,
        isProjectManager: true,
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', managerAuthToken)
        .send(payload)
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const createdMembership = await Membership.findOne({
            where: { userId: nonMemberUser.id, projectId: testProject.id },
          });
          if (!createdMembership) {
            return done('created membership was not found in database');
          }

          const { message, membership } = res.body;
          expect(message).toBe('membership has been successfully created');
          expect(membership).toEqual({
            id: createdMembership.id,
            user: {
              username: nonMemberUser.username,
              displayName: nonMemberUser.displayName,
            },
            project: {
              id: testProject.id,
              name: testProject.name,
            },
            isProjectAdmin: false,
            isProjectManager: true,
            createdOn: createdMembership.createdOn.toISOString(),
            createdBy: {
              username: managerUser.username,
              displayName: managerUser.displayName,
            },
          });
          done();
        });
    });

    it('should allow manager members to create viewer members', (done) => {
      payload = {
        username: nonMemberUser.username,
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', managerAuthToken)
        .send(payload)
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const createdMembership = await Membership.findOne({
            where: { userId: nonMemberUser.id, projectId: testProject.id },
          });
          if (!createdMembership) {
            return done('created membership was not found in database');
          }

          const { message, membership } = res.body;
          expect(message).toBe('membership has been successfully created');
          expect(membership).toEqual({
            id: createdMembership.id,
            user: {
              username: nonMemberUser.username,
              displayName: nonMemberUser.displayName,
            },
            project: {
              id: testProject.id,
              name: testProject.name,
            },
            isProjectAdmin: false,
            isProjectManager: false,
            createdOn: createdMembership.createdOn.toISOString(),
            createdBy: {
              username: managerUser.username,
              displayName: managerUser.displayName,
            },
          });
          done();
        });
    });
  });
});
