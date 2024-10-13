import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/errors';
import request from 'supertest';
import { User, Project } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
const apiRoute = '/projects';

describe('Project GetAll', () => {
  describe(`GET ${apiRoute}`, () => {
    let authenticatedUser: User;
    let testUser1: User;
    let testUser2: User;
    let sampleProject1: Project;
    let sampleProject2: Project;
    let authToken: string;

    beforeAll(async () => {
      authenticatedUser = await testHelper.createTestUser();
      testUser1 = await testHelper.createTestUser();
      testUser2 = await testHelper.createTestUser();

      await testHelper.createTestProject(
        authenticatedUser,
        'test project 1',
        'project1 was generated via automated testing.',
      );
      await testHelper.createTestProject(
        testUser2,
        'test project 2',
        'project2 was generated via automated testing.',
      );
      await testHelper.createTestProject(
        testUser1,
        'test project 3',
        'project3 was generated via automated testing.',
      );
      await testHelper.createTestProject(
        authenticatedUser,
        'test project 4',
        'project4 was generated via automated testing.',
      );
      sampleProject1 = await testHelper.createTestProject(
        testUser1,
        'test project 5',
        'project5 was generated via automated testing.',
      );
      sampleProject2 = await testHelper.createTestProject(
        testUser2,
        'test project 6',
        'project6 was generated via automated testing.',
      );

      sampleProject1.updatedById = testUser2.id;
      sampleProject1.updatedOn = new Date();
      await sampleProject1.save();

      const inactiveProject = await testHelper.createTestProject(authenticatedUser);
      inactiveProject.isActive = false;
      inactiveProject.deletedOn = new Date();
      inactiveProject.deletedById = authenticatedUser.id;
      await inactiveProject.save();

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

    it('should successfully return a list of projects', (done) => {
      request(serverUrl)
        .get(`${apiRoute}?itemsPerPage=2&page=3`)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, ...projectListData } = res.body;
          expect(message).toBe('project list has been successfully retrieved');
          expect(projectListData).toEqual({
            page: 3,
            itemsPerPage: 2,
            totalPages: 3,
            totalItems: 6,
            projects: [
              {
                id: sampleProject1.id,
                name: sampleProject1.name,
                description: sampleProject1.description,
                createdOn: sampleProject1.createdOn.toISOString(),
                createdBy: {
                  username: testUser1.username,
                  displayName: testUser1.displayName,
                },
                updatedOn: sampleProject1.updatedOn?.toISOString(),
                updatedBy: {
                  username: testUser2.username,
                  displayName: testUser2.displayName,
                },
              },
              {
                id: sampleProject2.id,
                name: sampleProject2.name,
                description: sampleProject2.description,
                createdOn: sampleProject2.createdOn.toISOString(),
                createdBy: {
                  username: testUser2.username,
                  displayName: testUser2.displayName,
                },
                updatedOn: null,
                updatedBy: null,
              },
            ],
          });

          done();
        });
    });
  });
});
