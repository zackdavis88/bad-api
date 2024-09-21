import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/errors';
import request from 'supertest';
import { Project, User, Membership } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/memberships/:membershipId';

describe('Membership GetOne', () => {
  describe(`GET ${apiRoute}`, () => {
    let projectMember1: User;
    let projectMember2: User;
    let testUser: User;
    let testProject: Project;
    let testMembership: Membership;
    let inactiveProject: Project;
    let authToken: string;

    beforeAll(async () => {
      projectMember1 = await testHelper.createTestUser();
      projectMember2 = await testHelper.createTestUser();
      testUser = await testHelper.createTestUser();

      inactiveProject = await testHelper.createTestProject(projectMember1);
      inactiveProject.isActive = false;
      await inactiveProject.save();

      testProject = await testHelper.createTestProject(projectMember1);
      testMembership = await testProject.createMembership({
        userId: projectMember2.id,
        createdById: projectMember1.id,
        updatedById: projectMember1.id,
        updatedOn: new Date(),
      });

      authToken = testHelper.generateToken(testUser);
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}/memberships/${testMembership.id}`;
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
      apiRoute = `/projects/somethingInvalid/memberships/${testMembership.id}`;
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
      apiRoute = `/projects/${testHelper.generateUUID()}/memberships/${testMembership.id}`;
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
      apiRoute = `/projects/${inactiveProject.id}/memberships/${testMembership.id}`;
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
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
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
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
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested membership not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should successfully retrieve membership details', (done) => {
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, membership } = res.body;
          expect(message).toBe('membership has been successfully retrieved');
          expect(membership).toEqual({
            id: testMembership.id,
            user: {
              username: projectMember2.username,
              displayName: projectMember2.displayName,
            },
            project: {
              id: testProject.id,
              name: testProject.name,
            },
            isProjectAdmin: false,
            isProjectManager: false,
            isProjectDeveloper: false,
            createdOn: testMembership.createdOn.toISOString(),
            updatedOn: testMembership.updatedOn?.toISOString(),
            createdBy: {
              username: projectMember1.username,
              displayName: projectMember1.displayName,
            },
            updatedBy: {
              username: projectMember1.username,
              displayName: projectMember1.displayName,
            },
          });
          done();
        });
    });
  });
});
