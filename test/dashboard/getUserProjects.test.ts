import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/errors';
import request from 'supertest';
import { User, Project } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
const apiRoute = '/dashboard/projects';

describe('Dashboard GetUserProjects', () => {
  describe(`GET ${apiRoute}`, () => {
    let authenticatedUser: User;
    let testUser1: User;
    let testUser2: User;
    let sampleProject1: Project;
    let sampleProject2: Project;
    let sampleProject3: Project;
    let sampleProject4: Project;
    let inactiveProject: Project;
    let authToken: string;

    beforeAll(async () => {
      authenticatedUser = await testHelper.createTestUser();
      testUser1 = await testHelper.createTestUser();
      testUser2 = await testHelper.createTestUser();

      sampleProject4 = await testHelper.createTestProject(
        authenticatedUser,
        'test project alpha',
        'project1 was generated via automated testing.',
      );
      await testHelper.createTestProject(
        testUser2,
        'test project beta',
        'project2 was generated via automated testing.',
      );
      await testHelper.createTestProject(
        testUser1,
        'test project charlie',
        'project3 was generated via automated testing.',
      );
      sampleProject3 = await testHelper.createTestProject(
        authenticatedUser,
        'test project delta',
        'project4 was generated via automated testing.',
      );
      sampleProject2 = await testHelper.createTestProject(
        testUser1,
        'test project echo',
        'project5 was generated via automated testing.',
      );
      sampleProject1 = await testHelper.createTestProject(
        testUser2,
        'test project foxtrot',
        'project6 was generated via automated testing.',
      );

      sampleProject1.updatedById = testUser2.id;
      sampleProject1.updatedOn = new Date();
      await sampleProject1.save();

      inactiveProject = await testHelper.createTestProject(
        authenticatedUser,
        'test project inactive',
        'generated via automated testing',
      );
      inactiveProject.isActive = false;
      inactiveProject.deletedOn = new Date();
      inactiveProject.deletedById = authenticatedUser.id;
      await inactiveProject.save();

      await sampleProject2.createMembership({
        userId: authenticatedUser.id,
        isProjectDeveloper: true,
      });

      await sampleProject1.createMembership({
        userId: authenticatedUser.id,
      });

      authToken = testHelper.generateToken(authenticatedUser);
    });

    afterAll(async () => {
      await testHelper.removeTestData();
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

    it('should successfully return a list of active projects that the authenticated user is a member of', (done) => {
      request(serverUrl)
        .get(`${apiRoute}?itemsPerPage=5&page=1`)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, ...projectListData } = res.body;
          expect(message).toBe('dashboard projects have been successfully retrieved');
          expect(projectListData).toEqual({
            page: 1,
            itemsPerPage: 5,
            totalPages: 1,
            totalItems: 4,
            projects: [
              {
                id: sampleProject1.id,
                name: sampleProject1.name,
                description: sampleProject1.description,
                createdOn: sampleProject1.createdOn.toISOString(),
                createdBy: {
                  username: testUser2.username,
                  displayName: testUser2.displayName,
                },
                updatedOn: sampleProject1.updatedOn?.toISOString(),
                role: 'Viewer',
              },
              {
                id: sampleProject2.id,
                name: sampleProject2.name,
                description: sampleProject2.description,
                createdOn: sampleProject2.createdOn.toISOString(),
                createdBy: {
                  username: testUser1.username,
                  displayName: testUser1.displayName,
                },
                updatedOn: null,
                role: 'Developer',
              },
              {
                id: sampleProject3.id,
                name: sampleProject3.name,
                description: sampleProject3.description,
                createdOn: sampleProject3.createdOn.toISOString(),
                createdBy: {
                  username: authenticatedUser.username,
                  displayName: authenticatedUser.displayName,
                },
                updatedOn: null,
                role: 'Admin',
              },
              {
                id: sampleProject4.id,
                name: sampleProject4.name,
                description: sampleProject4.description,
                createdOn: sampleProject4.createdOn.toISOString(),
                createdBy: {
                  username: authenticatedUser.username,
                  displayName: authenticatedUser.displayName,
                },
                updatedOn: null,
                role: 'Admin',
              },
            ],
          });

          done();
        });
    });

    it('should successfully filter projects by name', (done) => {
      request(serverUrl)
        .get(`${apiRoute}?nameFilter=echo`)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, ...projectListData } = res.body;
          expect(message).toBe('dashboard projects have been successfully retrieved');
          expect(projectListData).toEqual({
            page: 1,
            itemsPerPage: 10,
            totalPages: 1,
            totalItems: 1,
            projects: [
              {
                id: sampleProject2.id,
                name: sampleProject2.name,
                description: sampleProject2.description,
                createdOn: sampleProject2.createdOn.toISOString(),
                createdBy: {
                  username: testUser1.username,
                  displayName: testUser1.displayName,
                },
                updatedOn: null,
                role: 'Developer',
              },
            ],
          });

          done();
        });
    });
  });
});
