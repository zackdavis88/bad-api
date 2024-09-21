import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/errors';
import request from 'supertest';
import { Project, User, Membership } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/memberships/:membershipId';

describe('Membership Update', () => {
  describe(`POST ${apiRoute}`, () => {
    let projectMember1: User;
    let projectMember2: User;
    let projectMember3: User;
    let projectMember4: User;
    let projectMember5: User;
    let nonProjectMember: User;

    let testProject: Project;
    let inactiveProject: Project;

    let testAdminMembership1: Membership;
    let testAdminMembership2: Membership;
    let testManagerMembership: Membership;
    let testViewerMembership: Membership;
    let testDeveloperMembership: Membership;

    let adminAuthToken1: string;
    let adminAuthToken2: string;
    let managerAuthToken: string;
    let developerAuthToken: string;
    let viewerAuthToken: string;
    let nonMemberAuthToken: string;

    beforeAll(async () => {
      projectMember1 = await testHelper.createTestUser(); // admin
      projectMember2 = await testHelper.createTestUser(); // admin
      projectMember3 = await testHelper.createTestUser(); // manager
      projectMember4 = await testHelper.createTestUser(); // viewer
      projectMember5 = await testHelper.createTestUser(); // developer
      nonProjectMember = await testHelper.createTestUser(); // non-member

      inactiveProject = await testHelper.createTestProject(projectMember1);
      inactiveProject.isActive = false;
      await inactiveProject.save();

      testProject = await testHelper.createTestProject(projectMember1);
      testAdminMembership1 = await testProject.getMembership({
        where: { userId: projectMember1.id },
      });

      testAdminMembership2 = await testProject.createMembership({
        userId: projectMember2.id,
        createdById: projectMember1.id,
        updatedById: projectMember1.id,
        isProjectAdmin: true,
        updatedOn: new Date(),
      });

      testManagerMembership = await testProject.createMembership({
        userId: projectMember3.id,
        createdById: projectMember2.id,
        isProjectManager: true,
      });

      testViewerMembership = await testProject.createMembership({
        userId: projectMember4.id,
        createdById: projectMember3.id,
        updatedById: projectMember2.id,
        updatedOn: new Date(),
      });

      testDeveloperMembership = await testProject.createMembership({
        userId: projectMember5.id,
        createdBy: projectMember3.id,
        isProjectDeveloper: true,
      });

      adminAuthToken1 = testHelper.generateToken(projectMember1);
      adminAuthToken2 = testHelper.generateToken(projectMember2);
      managerAuthToken = testHelper.generateToken(projectMember3);
      developerAuthToken = testHelper.generateToken(projectMember5);
      viewerAuthToken = testHelper.generateToken(projectMember4);
      nonMemberAuthToken = testHelper.generateToken(nonProjectMember);
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}/memberships/${testViewerMembership.id}`;
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
      apiRoute = `/projects/wrong/memberships/${testViewerMembership.id}`;
      request(serverUrl).post(apiRoute).set('x-auth-token', adminAuthToken1).expect(
        400,
        {
          error: 'requested project id is not valid',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when the requested project does not exist', (done) => {
      apiRoute = `/projects/${testHelper.generateUUID()}/memberships/${testViewerMembership.id}`;
      request(serverUrl).post(apiRoute).set('x-auth-token', adminAuthToken1).expect(
        404,
        {
          error: 'requested project not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests when the requested project is not active', (done) => {
      apiRoute = `/projects/${inactiveProject.id}/memberships/${testViewerMembership.id}`;
      request(serverUrl).post(apiRoute).set('x-auth-token', adminAuthToken1).expect(
        404,
        {
          error: 'requested project not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests when membershipId is not a valid UUID', (done) => {
      apiRoute = `/projects/${testProject.id}/memberships/invalid`;
      request(serverUrl).post(apiRoute).set('x-auth-token', adminAuthToken1).expect(
        400,
        {
          error: 'requested membership id is not valid',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when the requested membership does not exist', (done) => {
      apiRoute = `/projects/${testProject.id}/memberships/${testHelper.generateUUID()}`;
      request(serverUrl).post(apiRoute).set('x-auth-token', adminAuthToken1).expect(
        404,
        {
          error: 'requested membership not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests when adding admin privileges to a non-admin as a non-member', (done) => {
      apiRoute = `/projects/${testProject.id}/memberships/${testViewerMembership.id}`;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', nonMemberAuthToken)
        .send({ isProjectAdmin: true })
        .expect(
          401,
          {
            error:
              'you do not have permission to add admin privileges to memberships for this project',
            errorType: ErrorTypes.AUTHORIZATION,
          },
          done,
        );
    });

    it('should reject requests when adding admin privileges to a non-admin as a non-admin', (done) => {
      apiRoute = `/projects/${testProject.id}/memberships/${testViewerMembership.id}`;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', managerAuthToken)
        .send({ isProjectAdmin: true })
        .expect(
          401,
          {
            error:
              'you do not have permission to add admin privileges to memberships for this project',
            errorType: ErrorTypes.AUTHORIZATION,
          },
          done,
        );
    });

    it('should reject requests when removing admin privileges from an admin as a non-member', (done) => {
      apiRoute = `/projects/${testProject.id}/memberships/${testAdminMembership1.id}`;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', nonMemberAuthToken)
        .send({ isProjectAdmin: false })
        .expect(
          401,
          {
            error:
              'you do not have permission to remove admin privileges from memberships for this project',
            errorType: ErrorTypes.AUTHORIZATION,
          },
          done,
        );
    });

    it('should reject requests when removing admin privileges from an admin as a non-admin', (done) => {
      apiRoute = `/projects/${testProject.id}/memberships/${testAdminMembership1.id}`;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', viewerAuthToken)
        .send({ isProjectAdmin: false })
        .expect(
          401,
          {
            error:
              'you do not have permission to remove admin privileges from memberships for this project',
            errorType: ErrorTypes.AUTHORIZATION,
          },
          done,
        );
    });

    it('should reject requests when updating memberships as a non-member', (done) => {
      apiRoute = `/projects/${testProject.id}/memberships/${testManagerMembership.id}`;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', nonMemberAuthToken)
        .send({ isProjectManager: false })
        .expect(
          401,
          {
            error: 'you do not have permission to update memberships for this project',
            errorType: ErrorTypes.AUTHORIZATION,
          },
          done,
        );
    });

    it('should reject requests when updating memberships as a developer', (done) => {
      apiRoute = `/projects/${testProject.id}/memberships/${testDeveloperMembership.id}`;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', developerAuthToken)
        .send({ isProjectDeveloper: true })
        .expect(
          401,
          {
            error: 'you do not have permission to update memberships for this project',
            errorType: ErrorTypes.AUTHORIZATION,
          },
          done,
        );
    });

    it('should reject requests when updating memberships as a viewer', (done) => {
      apiRoute = `/projects/${testProject.id}/memberships/${testAdminMembership2.id}`;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', viewerAuthToken)
        .send({ isProjectAdmin: true })
        .expect(
          401,
          {
            error: 'you do not have permission to update memberships for this project',
            errorType: ErrorTypes.AUTHORIZATION,
          },
          done,
        );
    });

    it('should reject requests when there is no input data', (done) => {
      request(serverUrl).post(apiRoute).set('x-auth-token', adminAuthToken1).expect(
        400,
        {
          error: 'input contains no update data',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when isProjectAdmin is present and not a boolean', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', managerAuthToken)
        .send({ isProjectAdmin: 'do it', isProjectManager: false })
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
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', adminAuthToken1)
        .send({ isProjectAdmin: false, isProjectManager: 'yes pls' })
        .expect(
          400,
          {
            error: 'isProjectManager must be a boolean',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should successfully allow admin members to add admin privileges', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', adminAuthToken1)
        .send({ isProjectAdmin: true })
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const updatedMembership = await testProject.getMembership({
            where: { id: testViewerMembership.id },
          });
          if (updatedMembership === null) {
            return done('updated membership was not found in database');
          }

          const { message, membership } = res.body;
          expect(message).toBe('membership has been successfully updated');
          expect(membership).toEqual({
            id: testViewerMembership.id,
            user: {
              username: projectMember4.username,
              displayName: projectMember4.displayName,
            },
            project: {
              id: testProject.id,
              name: testProject.name,
            },
            isProjectAdmin: true,
            isProjectManager: false,
            isProjectDeveloper: false,
            createdOn: testViewerMembership.createdOn.toISOString(),
            createdBy: {
              username: projectMember3.username,
              displayName: projectMember3.displayName,
            },
            updatedOn: updatedMembership.updatedOn.toISOString(),
            updatedBy: {
              username: projectMember1.username,
              displayName: projectMember1.displayName,
            },
          });
          expect(updatedMembership.isProjectAdmin).toBe(true);

          // Revert the testViewerMembership back to viewer privileges
          updatedMembership.isProjectAdmin = false;
          updatedMembership.isProjectManager = false;
          await updatedMembership.save();
          done();
        });
    });

    it('should successfully allow admin members to remove admin privileges', (done) => {
      apiRoute = `/projects/${testProject.id}/memberships/${testAdminMembership2.id}`;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', adminAuthToken1)
        .send({ isProjectAdmin: false, isProjectManager: true })
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const updatedMembership = await testProject.getMembership({
            where: { id: testAdminMembership2.id },
          });
          if (updatedMembership === null) {
            return done('updated membership was not found in database');
          }

          const { message, membership } = res.body;
          expect(message).toBe('membership has been successfully updated');
          expect(membership).toEqual({
            id: testAdminMembership2.id,
            user: {
              username: projectMember2.username,
              displayName: projectMember2.displayName,
            },
            project: {
              id: testProject.id,
              name: testProject.name,
            },
            isProjectAdmin: false,
            isProjectManager: true,
            isProjectDeveloper: false,
            createdOn: testAdminMembership2.createdOn.toISOString(),
            createdBy: {
              username: projectMember1.username,
              displayName: projectMember1.displayName,
            },
            updatedOn: updatedMembership.updatedOn.toISOString(),
            updatedBy: {
              username: projectMember1.username,
              displayName: projectMember1.displayName,
            },
          });
          expect(updatedMembership.isProjectAdmin).toBe(false);
          expect(updatedMembership.isProjectManager).toBe(true);

          // Revert testAdminMembership2 back to admin privileges
          updatedMembership.isProjectAdmin = true;
          updatedMembership.isProjectManager = false;
          await updatedMembership.save();
          done();
        });
    });

    it('should successfully allow admin members to remove manager privileges', (done) => {
      apiRoute = `/projects/${testProject.id}/memberships/${testManagerMembership.id}`;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', adminAuthToken2)
        .send({ isProjectAdmin: false, isProjectManager: false })
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const updatedMembership = await testProject.getMembership({
            where: { id: testManagerMembership.id },
          });
          if (updatedMembership === null) {
            return done('updated membership was not found in database');
          }

          const { message, membership } = res.body;
          expect(message).toBe('membership has been successfully updated');
          expect(membership).toEqual({
            id: testManagerMembership.id,
            user: {
              username: projectMember3.username,
              displayName: projectMember3.displayName,
            },
            project: {
              id: testProject.id,
              name: testProject.name,
            },
            isProjectAdmin: false,
            isProjectManager: false,
            isProjectDeveloper: false,
            createdOn: testManagerMembership.createdOn.toISOString(),
            createdBy: {
              username: projectMember2.username,
              displayName: projectMember2.displayName,
            },
            updatedOn: updatedMembership.updatedOn.toISOString(),
            updatedBy: {
              username: projectMember2.username,
              displayName: projectMember2.displayName,
            },
          });
          expect(updatedMembership.isProjectAdmin).toBe(false);
          expect(updatedMembership.isProjectManager).toBe(false);

          // Revert testManagerMembership back to manager privileges
          updatedMembership.isProjectAdmin = false;
          updatedMembership.isProjectManager = true;
          await updatedMembership.save();
          done();
        });
    });

    it('should successfully allow manager members to add manager privileges', (done) => {
      apiRoute = `/projects/${testProject.id}/memberships/${testViewerMembership.id}`;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', managerAuthToken)
        .send({ isProjectManager: true })
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const updatedMembership = await testProject.getMembership({
            where: { id: testViewerMembership.id },
          });
          if (updatedMembership === null) {
            return done('updated membership was not found in database');
          }

          const { message, membership } = res.body;
          expect(message).toBe('membership has been successfully updated');
          expect(membership).toEqual({
            id: testViewerMembership.id,
            user: {
              username: projectMember4.username,
              displayName: projectMember4.displayName,
            },
            project: {
              id: testProject.id,
              name: testProject.name,
            },
            isProjectAdmin: false,
            isProjectManager: true,
            isProjectDeveloper: false,
            createdOn: testViewerMembership.createdOn.toISOString(),
            createdBy: {
              username: projectMember3.username,
              displayName: projectMember3.displayName,
            },
            updatedOn: updatedMembership.updatedOn.toISOString(),
            updatedBy: {
              username: projectMember3.username,
              displayName: projectMember3.displayName,
            },
          });
          expect(updatedMembership.isProjectAdmin).toBe(false);
          expect(updatedMembership.isProjectManager).toBe(true);

          // Revert testViewerMembership back to viewer privileges
          updatedMembership.isProjectAdmin = false;
          updatedMembership.isProjectManager = false;
          await updatedMembership.save();
          done();
        });
    });

    it('should successfully allow manager members to remove manager privileges', (done) => {
      apiRoute = `/projects/${testProject.id}/memberships/${testManagerMembership.id}`;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', managerAuthToken)
        .send({ isProjectManager: false })
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const updatedMembership = await testProject.getMembership({
            where: { id: testManagerMembership.id },
          });
          if (updatedMembership === null) {
            return done('updated membership was not found in database');
          }

          const { message, membership } = res.body;
          expect(message).toBe('membership has been successfully updated');
          expect(membership).toEqual({
            id: testManagerMembership.id,
            user: {
              username: projectMember3.username,
              displayName: projectMember3.displayName,
            },
            project: {
              id: testProject.id,
              name: testProject.name,
            },
            isProjectAdmin: false,
            isProjectManager: false,
            isProjectDeveloper: false,
            createdOn: testManagerMembership.createdOn.toISOString(),
            createdBy: {
              username: projectMember2.username,
              displayName: projectMember2.displayName,
            },
            updatedOn: updatedMembership.updatedOn.toISOString(),
            updatedBy: {
              username: projectMember3.username,
              displayName: projectMember3.displayName,
            },
          });
          expect(updatedMembership.isProjectAdmin).toBe(false);
          expect(updatedMembership.isProjectManager).toBe(false);

          // Revert testManagerMembership back to viewer privileges
          updatedMembership.isProjectAdmin = false;
          updatedMembership.isProjectManager = true;
          await updatedMembership.save();
          done();
        });
    });
  });
});
