import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/errors';
import request from 'supertest';
import { User, Project, Status, Story } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/stories/:storyId';

describe('Story Update', () => {
  describe(`POST ${apiRoute}`, () => {
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
    let testStatus1: Status;
    let testStatus2: Status;
    let testStory: Story;

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
      testStatus1 = await testProject.createStatus({ name: 'Unit Test Status' });
      testStatus2 = await testProject.createStatus({ name: 'Second Unit Test Status' });

      inactiveProject = await testHelper.createTestProject(adminUser);
      inactiveProject.isActive = false;
      await inactiveProject.save();

      testStory = await testProject.createStory({
        title: 'Unit Test Story',
        details: 'some details go here.',
        createdById: managerUser.id,
      });
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}/stories/${testStory.id}`;
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
      apiRoute = `/projects/somethingInvalid/stories/${testStory.id}`;
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
      apiRoute = `/projects/${testHelper.generateUUID()}/stories/${testStory.id}`;
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
      apiRoute = `/projects/${inactiveProject.id}/stories/${testStory.id}`;
      request(serverUrl).post(apiRoute).set('x-auth-token', adminAuthToken).expect(
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
      request(serverUrl).post(apiRoute).set('x-auth-token', adminAuthToken).expect(
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
      request(serverUrl).post(apiRoute).set('x-auth-token', adminAuthToken).expect(
        404,
        {
          error: 'requested story not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should reject requests when the authenticated user is not a project member', (done) => {
      request(serverUrl).post(apiRoute).set('x-auth-token', nonMemberAuthToken).expect(
        401,
        {
          error: 'you do not have permission to update stories for this project',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should reject requests when the authenticated user is a viewer', (done) => {
      request(serverUrl).post(apiRoute).set('x-auth-token', viewerAuthToken).expect(
        401,
        {
          error: 'you do not have permission to update stories for this project',
          errorType: ErrorTypes.AUTHORIZATION,
        },
        done,
      );
    });

    it('should reject requests when title is not a string', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', developerAuthToken)
        .send({
          title: {},
        })
        .expect(
          400,
          {
            error: 'title must be a string',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when title is less than 1 character', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', developerAuthToken)
        .send({
          title: '',
        })
        .expect(
          400,
          {
            error: 'title must be 1 - 150 characters in length',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when title is more than 150 character', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', developerAuthToken)
        .send({
          title: Array(151).fill('a').join(''),
        })
        .expect(
          400,
          {
            error: 'title must be 1 - 150 characters in length',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when details is not a string', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', developerAuthToken)
        .send({
          details: false,
        })
        .expect(
          400,
          {
            error: 'details must be a string',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when status is not a string', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', developerAuthToken)
        .send({
          status: [],
        })
        .expect(
          400,
          {
            error: 'status must be a string',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when status is not a valid UUID', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', developerAuthToken)
        .send({
          status: 'wrong',
        })
        .expect(
          400,
          {
            error: 'requested status id is not valid',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when status is not found', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', developerAuthToken)
        .send({
          status: testHelper.generateUUID(),
        })
        .expect(
          404,
          {
            error: 'requested status not found',
            errorType: ErrorTypes.NOT_FOUND,
          },
          done,
        );
    });

    it('should reject requests when ownedBy is not a string', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', developerAuthToken)
        .send({
          ownedBy: {},
        })
        .expect(
          400,
          {
            error: 'ownedBy must be a string',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when the ownedBy user does not exist', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', developerAuthToken)
        .send({
          ownedBy: 'doesNotExistLol',
        })
        .expect(
          404,
          {
            error: 'ownedBy user does not exist',
            errorType: ErrorTypes.NOT_FOUND,
          },
          done,
        );
    });

    it('should reject requests when the ownedBy user is not a project member', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', developerAuthToken)
        .send({
          ownedBy: nonMember.username,
        })
        .expect(
          400,
          {
            error: 'ownedBy user must be a project member',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when the ownedBy user is a viewer', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', developerAuthToken)
        .send({
          ownedBy: viewerMember.displayName,
        })
        .expect(
          400,
          {
            error: 'ownedBy user must have developer permissions or higher',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when there is no update data', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', developerAuthToken)
        .send({})
        .expect(
          400,
          {
            error: 'input contains no update data',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should successfully update title', (done) => {
      const newTitle = 'this is a new title';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', developerAuthToken)
        .send({
          title: newTitle,
        })
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const { message, story } = res.body;
          expect(message).toBe('story has been successfully updated');
          expect(story.title).toBe(newTitle);

          const storyInDatabase = await testProject.getStory({
            where: { id: testStory.id },
          });
          if (!storyInDatabase) {
            return done('story not found in database');
          }

          expect(storyInDatabase.title).toBe(newTitle);
          done();
        });
    });

    it('should successfully update details', (done) => {
      const details = 'the details\nhave been\nupdated';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', developerAuthToken)
        .send({
          details,
        })
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const { message, story } = res.body;
          expect(message).toBe('story has been successfully updated');
          expect(story.details).toBe(details);

          const storyInDatabase = await testProject.getStory({
            where: { id: testStory.id },
          });
          if (!storyInDatabase) {
            return done('story not found in database');
          }

          expect(storyInDatabase.details).toBe(details);
          done();
        });
    });

    it('should successfully remove details if input is null', (done) => {
      const details = null;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', developerAuthToken)
        .send({
          details,
        })
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const { message, story } = res.body;
          expect(message).toBe('story has been successfully updated');
          expect(story.details).toBe(details);

          const storyInDatabase = await testProject.getStory({
            where: { id: testStory.id },
          });
          if (!storyInDatabase) {
            return done('story not found in database');
          }

          expect(storyInDatabase.details).toBe(details);
          done();
        });
    });

    it('should successfully remove details if input is empty-string', (done) => {
      const details = '';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', developerAuthToken)
        .send({
          details,
        })
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const { message, story } = res.body;
          expect(message).toBe('story has been successfully updated');
          expect(story.details).toBe(null);

          const storyInDatabase = await testProject.getStory({
            where: { id: testStory.id },
          });
          if (!storyInDatabase) {
            return done('story not found in database');
          }

          expect(storyInDatabase.details).toBe(null);
          done();
        });
    });

    it('should successfully update status', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', developerAuthToken)
        .send({
          status: testStatus1.id,
        })
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const { message, story } = res.body;
          expect(message).toBe('story has been successfully updated');
          expect(story.status).toEqual({
            id: testStatus1.id,
            name: testStatus1.name,
          });

          const storyInDatabase = await testProject.getStory({
            where: { id: testStory.id },
          });
          if (!storyInDatabase) {
            return done('story not found in database');
          }

          expect(storyInDatabase.statusId).toBe(testStatus1.id);
          done();
        });
    });

    it('should successfully remove status', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', developerAuthToken)
        .send({
          status: null,
        })
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const { message, story } = res.body;
          expect(message).toBe('story has been successfully updated');
          expect(story.status).toEqual(null);

          const storyInDatabase = await testProject.getStory({
            where: { id: testStory.id },
          });
          if (!storyInDatabase) {
            return done('story not found in database');
          }

          expect(storyInDatabase.statusId).toBe(null);
          done();
        });
    });

    it('should successfully update the story owner', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', developerAuthToken)
        .send({
          ownedBy: managerUser.username,
        })
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const { message, story } = res.body;
          expect(message).toBe('story has been successfully updated');
          expect(story.ownedBy).toEqual({
            username: managerUser.username,
            displayName: managerUser.displayName,
          });

          const storyInDatabase = await testProject.getStory({
            where: { id: testStory.id },
          });
          if (!storyInDatabase) {
            return done('story not found in database');
          }

          expect(storyInDatabase.ownedById).toBe(managerUser.id);
          done();
        });
    });

    it('should successfully remove the story owner', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', developerAuthToken)
        .send({
          ownedBy: null,
        })
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }

          const { message, story } = res.body;
          expect(message).toBe('story has been successfully updated');
          expect(story.ownedBy).toEqual(null);

          const storyInDatabase = await testProject.getStory({
            where: { id: testStory.id },
          });
          if (!storyInDatabase) {
            return done('story not found in database');
          }

          expect(storyInDatabase.ownedById).toBe(null);
          done();
        });
    });

    it('should successfully update a story for an admin', (done) => {
      const payload = {
        title: 'this is an updated title',
        details: 'these details are updated during unit testing',
        status: testStatus2.id,
        ownedBy: developerUser.displayName,
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

          const { message, story } = res.body;
          // Ensure the story was actually updated.
          const updatedTestStory = await testProject.getStory({
            where: { id: testStory.id },
          });
          if (!updatedTestStory) {
            return done('story was not found in database');
          }

          expect(message).toBe('story has been successfully updated');
          expect(story).toEqual({
            id: testStory.id,
            title: payload.title,
            details: payload.details,
            status: {
              id: testStatus2.id,
              name: testStatus2.name,
            },
            project: {
              id: testProject.id,
              name: testProject.name,
            },
            createdOn: testStory.createdOn.toISOString(),
            createdBy: {
              username: managerUser.username,
              displayName: managerUser.displayName,
            },
            ownedBy: {
              username: developerUser.username,
              displayName: developerUser.displayName,
            },
            updatedOn: updatedTestStory.updatedOn.toISOString(),
            updatedBy: {
              username: adminUser.username,
              displayName: adminUser.displayName,
            },
          });
          done();
        });
    });

    it('should successfully update a story for a manager', (done) => {
      const payload = {
        title: 'this is an updated title - manager',
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', managerAuthToken)
        .send(payload)
        .expect(200, done);
    });

    it('should successfully update a story for a developer', (done) => {
      const payload = {
        title: 'this is an updated title - developer',
      };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', developerAuthToken)
        .send(payload)
        .expect(200, done);
    });
  });
});
