import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/errors';
import request from 'supertest';
import { Project, User, Membership } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/memberships/:membershipId';

describe('Membership Remove', () => {
  describe(`DELETE ${apiRoute}`, () => {
    let projectAdminMember1: User;
    let projectAdminMember2: User;
    let projectManagerMember: User;
    let projectViewerMember: User;
    let nonMember: User;
    let testProject: Project;
    let inactiveProject: Project;
    let testAdminMembership: Membership;
    let testManagerMembership: Membership;
    let testViewerMembership: Membership;
    let adminAuthToken: string;
    let managerAuthToken: string;
    let viewerAuthToken: string;
    let nonMemberAuthToken: string;

    beforeAll(async () => {
      projectAdminMember1 = await testHelper.createTestUser();
      projectAdminMember2 = await testHelper.createTestUser();
      projectManagerMember = await testHelper.createTestUser();
      projectViewerMember = await testHelper.createTestUser();
      nonMember = await testHelper.createTestUser();

      testProject = await testHelper.createTestProject(projectAdminMember1);
      inactiveProject = await testHelper.createTestProject(projectAdminMember1);
      inactiveProject.isActive = false;
      await inactiveProject.save();

      testAdminMembership = await testProject.createMembership({
        userId: projectAdminMember2.id,
        createdById: projectAdminMember1.id,
        updatedById: projectAdminMember1.id,
        updatedOn: new Date(),
        isProjectAdmin: true,
      });
      testManagerMembership = await testProject.createMembership({
        userId: projectManagerMember.id,
        createdById: projectAdminMember2.id,
        isProjectManager: true,
      });
      testViewerMembership = await testProject.createMembership({
        userId: projectViewerMember.id,
        createdById: projectAdminMember1.id,
      });

      adminAuthToken = testHelper.generateToken(projectAdminMember1);
      managerAuthToken = testHelper.generateToken(projectManagerMember);
      viewerAuthToken = testHelper.generateToken(projectViewerMember);
      nonMemberAuthToken = testHelper.generateToken(nonMember);
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}/memberships/${testManagerMembership.id}`;
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
      apiRoute = `/projects/somethingInvalid/memberships/${testManagerMembership.id}`;
      request(serverUrl).delete(apiRoute).set('x-auth-token', adminAuthToken).expect(
        400,
        {
          error: 'requested project id is not valid',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when the requested project does not exist', (done) => {
      apiRoute = `/projects/${testHelper.generateUUID()}/memberships/${testManagerMembership.id}`;
      request(serverUrl).delete(apiRoute).set('x-auth-token', adminAuthToken).expect(
        404,
        {
          error: 'requested project not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests when the requested project is not active', (done) => {
      apiRoute = `/projects/${inactiveProject.id}/memberships/${testManagerMembership.id}`;
      request(serverUrl).delete(apiRoute).set('x-auth-token', adminAuthToken).expect(
        404,
        {
          error: 'requested project not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests when membershipId is not a valid UUID', (done) => {
      apiRoute = `/projects/${testProject.id}/memberships/wrong`;
      request(serverUrl).delete(apiRoute).set('x-auth-token', adminAuthToken).expect(
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
      request(serverUrl).delete(apiRoute).set('x-auth-token', adminAuthToken).expect(
        404,
        {
          error: 'requested membership not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests when removing an admin as a non-member', (done) => {
      apiRoute = `/projects/${testProject.id}/memberships/${testAdminMembership.id}`;
      request(serverUrl).delete(apiRoute).set('x-auth-token', nonMemberAuthToken).expect(
        401,
        {
          error:
            'you do not have permission to remove admin memberships for this project',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should reject requests when removing an admin as a manager', (done) => {
      apiRoute = `/projects/${testProject.id}/memberships/${testAdminMembership.id}`;
      request(serverUrl).delete(apiRoute).set('x-auth-token', managerAuthToken).expect(
        401,
        {
          error:
            'you do not have permission to remove admin memberships for this project',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should reject requests when removing a membership as a non-member', (done) => {
      apiRoute = `/projects/${testProject.id}/memberships/${testViewerMembership.id}`;
      request(serverUrl).delete(apiRoute).set('x-auth-token', nonMemberAuthToken).expect(
        401,
        {
          error: 'you do not have permission to remove memberships for this project',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should reject requests when removing a membership as a viewer', (done) => {
      apiRoute = `/projects/${testProject.id}/memberships/${testManagerMembership.id}`;
      request(serverUrl).delete(apiRoute).set('x-auth-token', viewerAuthToken).expect(
        401,
        {
          error: 'you do not have permission to remove memberships for this project',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should reject requests when confirm is missing from input', (done) => {
      request(serverUrl).delete(apiRoute).set('x-auth-token', adminAuthToken).expect(
        400,
        {
          error: 'confirm is missing from input',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when confirm is not a boolean', (done) => {
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', adminAuthToken)
        .send({ confirm: 'do it' })
        .expect(
          400,
          {
            error: 'confirm input must be a boolean',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when confirm is not set to true', (done) => {
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', adminAuthToken)
        .send({ confirm: false })
        .expect(
          400,
          {
            error: 'confirm input must have a value of true',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should successfully remove admin memberships as an admin', (done) => {
      apiRoute = `/projects/${testProject.id}/memberships/${testAdminMembership.id}`;
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', adminAuthToken)
        .send({ confirm: true })
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const { message, membership } = res.body;
          expect(message).toBe('membership has been successfully removed');
          expect(membership).toEqual({
            id: testAdminMembership.id,
            user: {
              username: projectAdminMember2.username,
              displayName: projectAdminMember2.displayName,
            },
            project: {
              id: testProject.id,
              name: testProject.name,
            },
            isProjectAdmin: true,
            isProjectManager: false,
            createdOn: testAdminMembership.createdOn.toISOString(),
            createdBy: {
              username: projectAdminMember1.username,
              displayName: projectAdminMember1.displayName,
            },
            updatedOn: testAdminMembership.updatedOn?.toISOString(),
            updatedBy: {
              username: projectAdminMember1.username,
              displayName: projectAdminMember1.displayName,
            },
            deletedOn: membership.deletedOn,
            deletedBy: {
              username: projectAdminMember1.username,
              displayName: projectAdminMember1.displayName,
            },
          });

          // Confirm that the membership is actually removed
          const removedMembership = await testProject.getMembership({
            where: { id: testAdminMembership.id },
          });
          expect(removedMembership).toBe(null);
          done();
        });
    });

    it('should successfully remove manager memberships as an admin', (done) => {
      apiRoute = `/projects/${testProject.id}/memberships/${testManagerMembership.id}`;
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', adminAuthToken)
        .send({ confirm: true })
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const { message, membership } = res.body;
          expect(message).toBe('membership has been successfully removed');
          expect(membership).toEqual({
            id: testManagerMembership.id,
            user: {
              username: projectManagerMember.username,
              displayName: projectManagerMember.displayName,
            },
            project: {
              id: testProject.id,
              name: testProject.name,
            },
            isProjectAdmin: false,
            isProjectManager: true,
            createdOn: testManagerMembership.createdOn.toISOString(),
            createdBy: {
              username: projectAdminMember2.username,
              displayName: projectAdminMember2.displayName,
            },
            updatedOn: null,
            updatedBy: null,
            deletedOn: membership.deletedOn,
            deletedBy: {
              username: projectAdminMember1.username,
              displayName: projectAdminMember1.displayName,
            },
          });

          // Confirm that the membership is actually removed
          const removedMembership = await testProject.getMembership({
            where: { id: testManagerMembership.id },
          });
          expect(removedMembership).toBe(null);

          // Restore the manager membership for other tests to use
          testManagerMembership = await testProject.createMembership({
            userId: projectManagerMember.id,
            createdById: projectAdminMember2.id,
            isProjectManager: true,
          });

          done();
        });
    });

    it('should successfully remove viewer memberships as an admin', (done) => {
      apiRoute = `/projects/${testProject.id}/memberships/${testViewerMembership.id}`;
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', adminAuthToken)
        .send({ confirm: true })
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const { message, membership } = res.body;
          expect(message).toBe('membership has been successfully removed');
          expect(membership).toEqual({
            id: testViewerMembership.id,
            user: {
              username: projectViewerMember.username,
              displayName: projectViewerMember.displayName,
            },
            project: {
              id: testProject.id,
              name: testProject.name,
            },
            isProjectAdmin: false,
            isProjectManager: false,
            createdOn: testViewerMembership.createdOn.toISOString(),
            createdBy: {
              username: projectAdminMember1.username,
              displayName: projectAdminMember1.displayName,
            },
            updatedOn: null,
            updatedBy: null,
            deletedOn: membership.deletedOn,
            deletedBy: {
              username: projectAdminMember1.username,
              displayName: projectAdminMember1.displayName,
            },
          });

          // Confirm that the membership is actually removed
          const removedMembership = await testProject.getMembership({
            where: { id: testViewerMembership.id },
          });
          expect(removedMembership).toBe(null);

          // Restore the manager membership for other tests to use
          testViewerMembership = await testProject.createMembership({
            userId: projectViewerMember.id,
            createdById: projectAdminMember1.id,
          });

          done();
        });
    });

    it('should successfully remove manager memberships as a manager', (done) => {
      apiRoute = `/projects/${testProject.id}/memberships/${testManagerMembership.id}`;
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', managerAuthToken)
        .send({ confirm: true })
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const { message, membership } = res.body;
          expect(message).toBe('membership has been successfully removed');
          expect(membership).toEqual({
            id: testManagerMembership.id,
            user: {
              username: projectManagerMember.username,
              displayName: projectManagerMember.displayName,
            },
            project: {
              id: testProject.id,
              name: testProject.name,
            },
            isProjectAdmin: false,
            isProjectManager: true,
            createdOn: testManagerMembership.createdOn.toISOString(),
            createdBy: {
              username: projectAdminMember2.username,
              displayName: projectAdminMember2.displayName,
            },
            updatedOn: null,
            updatedBy: null,
            deletedOn: membership.deletedOn,
            deletedBy: {
              username: projectManagerMember.username,
              displayName: projectManagerMember.displayName,
            },
          });

          // Confirm that the membership is actually removed
          const removedMembership = await testProject.getMembership({
            where: { id: testManagerMembership.id },
          });
          expect(removedMembership).toBe(null);

          // Restore the manager membership for other tests to use
          testManagerMembership = await testProject.createMembership({
            userId: projectManagerMember.id,
            createdById: projectAdminMember2.id,
            isProjectManager: true,
          });

          done();
        });
    });

    it('should successfully remove viewer memberships as a manager', (done) => {
      apiRoute = `/projects/${testProject.id}/memberships/${testViewerMembership.id}`;
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', managerAuthToken)
        .send({ confirm: true })
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const { message, membership } = res.body;
          expect(message).toBe('membership has been successfully removed');
          expect(membership).toEqual({
            id: testViewerMembership.id,
            user: {
              username: projectViewerMember.username,
              displayName: projectViewerMember.displayName,
            },
            project: {
              id: testProject.id,
              name: testProject.name,
            },
            isProjectAdmin: false,
            isProjectManager: false,
            createdOn: testViewerMembership.createdOn.toISOString(),
            createdBy: {
              username: projectAdminMember1.username,
              displayName: projectAdminMember1.displayName,
            },
            updatedOn: null,
            updatedBy: null,
            deletedOn: membership.deletedOn,
            deletedBy: {
              username: projectManagerMember.username,
              displayName: projectManagerMember.displayName,
            },
          });

          // Confirm that the membership is actually removed
          const removedMembership = await testProject.getMembership({
            where: { id: testViewerMembership.id },
          });
          expect(removedMembership).toBe(null);

          done();
        });
    });
  });
});
