import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/errors';
import request from 'supertest';
import { Project, User, Membership } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/memberships';

describe('Membership GetAll', () => {
  describe(`GET ${apiRoute}`, () => {
    let projectMember1: User;
    let projectMember2: User;
    let projectMember3: User;
    let projectMember4: User;
    let projectMember5: User;
    let projectMember6: User;
    let projectMember7: User;
    let projectMember8: User;
    let expectedMembership1: Membership;
    let expectedMembership2: Membership;
    let expectedMembership3: Membership;
    let testUser: User;
    let testProject: Project;
    let inactiveProject: Project;
    let authToken: string;

    beforeAll(async () => {
      projectMember1 = await testHelper.createTestUser();
      projectMember2 = await testHelper.createTestUser();
      projectMember3 = await testHelper.createTestUser();
      projectMember4 = await testHelper.createTestUser();
      projectMember5 = await testHelper.createTestUser();
      projectMember6 = await testHelper.createTestUser();
      projectMember7 = await testHelper.createTestUser();
      projectMember8 = await testHelper.createTestUser();
      testUser = await testHelper.createTestUser();

      inactiveProject = await testHelper.createTestProject(projectMember1);
      inactiveProject.isActive = false;
      await inactiveProject.save();

      testProject = await testHelper.createTestProject(projectMember1);
      await testProject.createMembership({
        userId: projectMember2.id,
        isProjectAdmin: true,
        createdById: projectMember1.id,
      });
      await testProject.createMembership({
        userId: projectMember3.id,
        isProjectAdmin: true,
        createdById: projectMember2.id,
      });
      await testProject.createMembership({
        userId: projectMember4.id,
        isProjectManager: true,
        createdById: projectMember3.id,
      });
      await testProject.createMembership({
        userId: projectMember5.id,
        createdById: projectMember1.id,
      });
      expectedMembership1 = await testProject.createMembership({
        userId: projectMember6.id,
        isProjectManager: true,
        createdById: projectMember4.id,
      });
      expectedMembership2 = await testProject.createMembership({
        userId: projectMember7.id,
        isProjectManager: true,
        createdById: projectMember6.id,
      });
      expectedMembership3 = await testProject.createMembership({
        projectId: testProject.id,
        userId: projectMember8.id,
        createdById: projectMember3.id,
        updatedOn: new Date(),
        updatedById: projectMember1.id,
      });

      authToken = testHelper.generateToken(testUser);
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}/memberships`;
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
      apiRoute = '/projects/somethingInvalid/memberships';
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
      apiRoute = `/projects/${testHelper.generateUUID()}/memberships`;
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
      apiRoute = `/projects/${inactiveProject.id}/memberships`;
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested project not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should successfully return a list of memberships for a project', (done) => {
      request(serverUrl)
        .get(`${apiRoute}?itemsPerPage=5&page=2`)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, ...membershipListData } = res.body;
          expect(message).toBe('membership list has been successfully retrieved');
          expect(membershipListData).toEqual({
            page: 2,
            totalItems: 8,
            totalPages: 2,
            itemsPerPage: 5,
            project: {
              id: testProject.id,
              name: testProject.name,
            },
            memberships: [
              {
                id: expectedMembership1.id,
                user: {
                  username: projectMember6.username,
                  displayName: projectMember6.displayName,
                },
                isProjectAdmin: false,
                isProjectManager: true,
                createdOn: expectedMembership1.createdOn.toISOString(),
                updatedOn: null,
                createdBy: {
                  username: projectMember4.username,
                  displayName: projectMember4.displayName,
                },
                updatedBy: null,
              },
              {
                id: expectedMembership2.id,
                user: {
                  username: projectMember7.username,
                  displayName: projectMember7.displayName,
                },
                isProjectAdmin: false,
                isProjectManager: true,
                createdOn: expectedMembership2.createdOn.toISOString(),
                updatedOn: null,
                createdBy: {
                  username: projectMember6.username,
                  displayName: projectMember6.displayName,
                },
                updatedBy: null,
              },
              {
                id: expectedMembership3.id,
                user: {
                  username: projectMember8.username,
                  displayName: projectMember8.displayName,
                },
                isProjectAdmin: false,
                isProjectManager: false,
                createdOn: expectedMembership3.createdOn.toISOString(),
                updatedOn: expectedMembership3.updatedOn?.toISOString(),
                createdBy: {
                  username: projectMember3.username,
                  displayName: projectMember3.displayName,
                },
                updatedBy: {
                  username: projectMember1.username,
                  displayName: projectMember1.displayName,
                },
              },
            ],
          });
          done();
        });
    });
  });
});
