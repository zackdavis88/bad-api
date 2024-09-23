import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/errors';
import request from 'supertest';
import { User, Project, Status, Story } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/stories/:storyId';

describe('Story GetOne', () => {
  describe(`GET ${apiRoute}`, () => {
    let adminUser: User;
    let adminAuthToken: string;
    let managerUser: User;
    let developerUser: User;
    let nonMember: User;
    let nonMemberAuthToken: string;
    let testProject: Project;
    let inactiveProject: Project;
    let testStatus: Status;
    let testStory: Story;

    beforeAll(async () => {
      adminUser = await testHelper.createTestUser();
      adminAuthToken = testHelper.generateToken(adminUser);

      managerUser = await testHelper.createTestUser();

      developerUser = await testHelper.createTestUser();

      nonMember = await testHelper.createTestUser();
      nonMemberAuthToken = testHelper.generateToken(nonMember);

      testProject = await testHelper.createTestProject(adminUser);
      await testProject.createMembership({
        userId: managerUser.id,
        createdBy: adminUser.id,
        isProjectManager: true,
      });
      await testProject.createMembership({
        userId: developerUser.id,
        createdBy: adminUser.id,
        isProjectDeveloper: true,
      });
      testStatus = await testProject.createStatus({ name: 'Unit Test Status' });

      inactiveProject = await testHelper.createTestProject(adminUser);
      inactiveProject.isActive = false;
      await inactiveProject.save();

      testStory = await testProject.createStory({
        title: 'Unit Test Story',
        details: 'Generated via unit\n testing',
        createdById: managerUser.id,
        updatedById: adminUser.id,
        ownedById: developerUser.id,
        updatedOn: new Date(),
        statusId: testStatus.id,
      });
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}/stories/${testStory.id}`;
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
      apiRoute = `/projects/somethingInvalid/stories/${testStory.id}`;
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
      apiRoute = `/projects/${testHelper.generateUUID()}/stories/${testStory.id}`;
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
      apiRoute = `/projects/${inactiveProject.id}/stories/${testStory.id}`;
      request(serverUrl).get(apiRoute).set('x-auth-token', adminAuthToken).expect(
        404,
        {
          error: 'requested project not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests when storyId is not a valid UUID', (done) => {
      apiRoute = `/projects/${testProject.id}/stories/wrong`;
      request(serverUrl).get(apiRoute).set('x-auth-token', adminAuthToken).expect(
        400,
        {
          error: 'requested story id is not valid',
          errorType: ErrorTypes.VALIDATION,
        },
        done,
      );
    });

    it('should reject requests when the requested story does not exist', (done) => {
      apiRoute = `/projects/${testProject.id}/stories/${testHelper.generateUUID()}`;
      request(serverUrl).get(apiRoute).set('x-auth-token', adminAuthToken).expect(
        404,
        {
          error: 'requested story not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests when the authenticated user is not a project member', (done) => {
      request(serverUrl).get(apiRoute).set('x-auth-token', nonMemberAuthToken).expect(
        401,
        {
          error: 'you do not have permission to read stories for this project',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should successfully retrieve story details', (done) => {
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-token', adminAuthToken)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, story } = res.body;
          expect(message).toBe('story has been successfully retrieved');
          expect(story).toEqual({
            id: testStory.id,
            title: testStory.title,
            details: testStory.details,
            createdOn: testStory.createdOn.toISOString(),
            updatedOn: testStory.updatedOn?.toISOString(),
            createdBy: {
              username: managerUser.username,
              displayName: managerUser.displayName,
            },
            updatedBy: {
              username: adminUser.username,
              displayName: adminUser.displayName,
            },
            ownedBy: {
              username: developerUser.username,
              displayName: developerUser.displayName,
            },
            status: {
              id: testStatus.id,
              name: testStatus.name,
            },
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
