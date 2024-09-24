import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/errors';
import request from 'supertest';
import { User, Project, Status, Story } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/stories/:storyId';

describe('Story Remove', () => {
  describe(`DELETE ${apiRoute}`, () => {
    let adminUser: User;
    let adminAuthToken: string;
    let managerUser: User;
    let managerAuthToken: string;
    let developerUser: User;
    let developerAuthToken: string;
    let nonMember: User;
    let nonMemberAuthToken: string;
    let viewerMember: User;
    let viewerAuthToken: string;
    let testProject: Project;
    let inactiveProject: Project;
    let testStatus: Status;
    let testStory: Story;
    let payload: {
      confirm: unknown;
    };

    beforeAll(async () => {
      adminUser = await testHelper.createTestUser();
      adminAuthToken = testHelper.generateToken(adminUser);

      managerUser = await testHelper.createTestUser();
      managerAuthToken = testHelper.generateToken(managerUser);

      developerUser = await testHelper.createTestUser();
      developerAuthToken = testHelper.generateToken(developerUser);

      nonMember = await testHelper.createTestUser();
      nonMemberAuthToken = testHelper.generateToken(nonMember);

      viewerMember = await testHelper.createTestUser();
      viewerAuthToken = testHelper.generateToken(viewerMember);

      testProject = await testHelper.createTestProject(adminUser);
      await testProject.createMembership({
        userId: viewerMember.id,
        createdBy: adminUser.id,
      });
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
        details: 'some details go here.',
        createdById: managerUser.id,
        statusId: testStatus.id,
        ownedById: developerUser.id,
      });
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}/stories/${testStory.id}`;
      payload = {
        confirm: true,
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
      apiRoute = `/projects/somethingInvalid/stories/${testStory.id}`;
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
      apiRoute = `/projects/${testHelper.generateUUID()}/stories/${testStory.id}`;
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
      apiRoute = `/projects/${inactiveProject.id}/stories/${testStory.id}`;
      request(serverUrl).delete(apiRoute).set('x-auth-token', adminAuthToken).expect(
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
      request(serverUrl).delete(apiRoute).set('x-auth-token', adminAuthToken).expect(
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
      request(serverUrl).delete(apiRoute).set('x-auth-token', adminAuthToken).expect(
        404,
        {
          error: 'requested story not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests when the authenticated user is not a project member', (done) => {
      request(serverUrl).delete(apiRoute).set('x-auth-token', nonMemberAuthToken).expect(
        401,
        {
          error: 'you do not have permission to remove stories for this project',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should reject requests when the authenticated user is a viewer', (done) => {
      request(serverUrl).delete(apiRoute).set('x-auth-token', viewerAuthToken).expect(
        401,
        {
          error: 'you do not have permission to remove stories for this project',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should reject requests when confirm is missing', (done) => {
      payload.confirm = undefined;
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', adminAuthToken)
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

    it('should reject requests when confirm is not a boolean', (done) => {
      payload.confirm = 'do eet!';
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', adminAuthToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'confirm input must be a boolean',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when confirm is not true', (done) => {
      payload.confirm = false;
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', adminAuthToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'confirm input must have a value of true',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should successfully remove a story for an admin', (done) => {
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', adminAuthToken)
        .send(payload)
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const { message, story } = res.body;
          expect(message).toBe('story has been successfully removed');
          expect(story).toEqual({
            id: testStory.id,
            title: testStory.title,
            details: testStory.details,
            status: {
              id: testStatus.id,
              name: testStatus.name,
            },
            ownedBy: {
              username: developerUser.username,
              displayName: developerUser.displayName,
            },
            createdOn: testStory.createdOn.toISOString(),
            createdBy: {
              username: managerUser.username,
              displayName: managerUser.displayName,
            },
            updatedOn: null,
            updatedBy: null,
            project: {
              id: testProject.id,
              name: testProject.name,
            },
          });

          // Ensure the story was actually deleted in the database.
          const storyInDatabase = await testProject.getStory({
            where: { id: testStory.id },
          });
          if (storyInDatabase) {
            return done('story was not removed from the database');
          }

          // Recreate the story so that other tests can use it
          testStory = await testProject.createStory({
            title: 'Unit Test Story',
            details: 'some details go here.',
            createdById: managerUser.id,
            statusId: testStatus.id,
            ownedById: developerUser.id,
          });
          done();
        });
    });

    it('should successfully remove a story for a manager', (done) => {
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', managerAuthToken)
        .send(payload)
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const { message, story } = res.body;
          expect(message).toBe('story has been successfully removed');
          expect(story).toEqual({
            id: testStory.id,
            title: testStory.title,
            details: testStory.details,
            status: {
              id: testStatus.id,
              name: testStatus.name,
            },
            ownedBy: {
              username: developerUser.username,
              displayName: developerUser.displayName,
            },
            createdOn: testStory.createdOn.toISOString(),
            createdBy: {
              username: managerUser.username,
              displayName: managerUser.displayName,
            },
            updatedOn: null,
            updatedBy: null,
            project: {
              id: testProject.id,
              name: testProject.name,
            },
          });

          // Ensure the story was actually deleted in the database.
          const storyInDatabase = await testProject.getStory({
            where: { id: testStory.id },
          });
          if (storyInDatabase) {
            return done('story was not removed from the database');
          }

          // Recreate the story so that other tests can use it
          testStory = await testProject.createStory({
            title: 'Unit Test Story',
            details: 'some details go here.',
            createdById: managerUser.id,
            statusId: testStatus.id,
            ownedById: developerUser.id,
          });
          done();
        });
    });

    it('should successfully remove a story for a developer', (done) => {
      request(serverUrl)
        .delete(apiRoute)
        .set('x-auth-token', developerAuthToken)
        .send(payload)
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const { message, story } = res.body;
          expect(message).toBe('story has been successfully removed');
          expect(story).toEqual({
            id: testStory.id,
            title: testStory.title,
            details: testStory.details,
            status: {
              id: testStatus.id,
              name: testStatus.name,
            },
            ownedBy: {
              username: developerUser.username,
              displayName: developerUser.displayName,
            },
            createdOn: testStory.createdOn.toISOString(),
            createdBy: {
              username: managerUser.username,
              displayName: managerUser.displayName,
            },
            updatedOn: null,
            updatedBy: null,
            project: {
              id: testProject.id,
              name: testProject.name,
            },
          });

          // Ensure the story was actually deleted in the database.
          const storyInDatabase = await testProject.getStory({
            where: { id: testStory.id },
          });
          if (storyInDatabase) {
            return done('story was not removed from the database');
          }

          // Recreate the story so that other tests can use it
          testStory = await testProject.createStory({
            title: 'Unit Test Story',
            details: 'some details go here.',
            createdById: managerUser.id,
            statusId: testStatus.id,
            ownedById: developerUser.id,
          });
          done();
        });
    });
  });
});
