import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/errors';
import request from 'supertest';
import { User, Project, Status, Story } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId/stories';

describe('Story GetAll', () => {
  describe(`GET ${apiRoute}`, () => {
    let adminUser: User;
    let adminAuthToken: string;
    let managerUser: User;
    let developerUser: User;
    let nonMember: User;
    let nonMemberAuthToken: string;

    let testProject: Project;
    let inactiveProject: Project;

    let existingStatus: Status;

    let story1: Story;
    let story2: Story;
    let story3: Story;

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
      existingStatus = await testProject.createStatus({ name: 'Test Status' });

      inactiveProject = await testHelper.createTestProject(adminUser);
      inactiveProject.isActive = false;
      await inactiveProject.save();

      story1 = await testProject.createStory({
        title: 'Story 1',
        details: 'Generated via unit testing',
        createdById: managerUser.id,
      });

      story2 = await testProject.createStory({
        title: 'Story 2',
        details: 'Generated via unit testing',
        createdById: managerUser.id,
        ownedById: developerUser.id,
        statusId: existingStatus.id,
      });

      story3 = await testProject.createStory({
        title: 'Story 3',
        details: 'Generated via unit testing',
        createdById: adminUser.id,
        updatedById: developerUser.id,
        updatedOn: new Date(),
      });

      await testProject.createStory({
        title: 'Story 4',
        details: 'Generated via unit testing',
        createdById: adminUser.id,
      });
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}/stories`;
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
      apiRoute = '/projects/somethingInvalid/stories';
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
      apiRoute = `/projects/${testHelper.generateUUID()}/stories`;
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
      apiRoute = `/projects/${inactiveProject.id}/stories`;
      request(serverUrl).get(apiRoute).set('x-auth-token', adminAuthToken).expect(
        404,
        {
          error: 'requested project not found',
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

    it('should successfully return a list of stories for a project', (done) => {
      request(serverUrl)
        .get(apiRoute)
        .query({
          itemsPerPage: 3,
          page: 1,
        })
        .set('x-auth-token', adminAuthToken)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, project, stories, ...paginationData } = res.body;
          expect(message).toBe('story list has been successfully retrieved');
          expect(project).toEqual({
            id: testProject.id,
            name: testProject.name,
          });
          expect(paginationData).toEqual({
            page: 1,
            totalItems: 4,
            totalPages: 2,
            itemsPerPage: 3,
          });
          expect(stories).toEqual([
            {
              id: story1.id,
              title: story1.title,
              createdOn: story1.createdOn.toISOString(),
              createdBy: {
                username: managerUser.username,
                displayName: managerUser.displayName,
              },
              updatedOn: null,
              updatedBy: null,
              ownedBy: null,
              status: null,
            },
            {
              id: story2.id,
              title: story2.title,
              createdOn: story2.createdOn.toISOString(),
              createdBy: {
                username: managerUser.username,
                displayName: managerUser.displayName,
              },
              updatedOn: null,
              updatedBy: null,
              ownedBy: {
                username: developerUser.username,
                displayName: developerUser.displayName,
              },
              status: {
                id: existingStatus.id,
                name: existingStatus.name,
              },
            },
            {
              id: story3.id,
              title: story3.title,
              createdOn: story3.createdOn.toISOString(),
              createdBy: {
                username: adminUser.username,
                displayName: adminUser.displayName,
              },
              updatedOn: story3.updatedOn?.toISOString(),
              updatedBy: {
                username: developerUser.username,
                displayName: developerUser.displayName,
              },
              ownedBy: null,
              status: null,
            },
          ]);
          done();
        });
    });
  });
});
