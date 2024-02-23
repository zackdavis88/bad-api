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
    let testProject: Project;
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
      testProject = await testHelper.createTestProject(
        testUser1,
        'test project 5',
        'project5 was generated via automated testing.',
      );
      await testHelper.createTestProject(
        testUser2,
        'test project 6',
        'project6 was generated via automated testing.',
      );

      testProject.updatedById = testUser2.id;
      testProject.updatedOn = new Date();
      await testProject.save();

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

          const { message, projects, page, itemsPerPage, totalPages, totalItems } =
            res.body;
          expect(message).toBe('project list has been successfully retrieved');
          expect(page).toBe(3);
          expect(itemsPerPage).toBe(2);
          expect(totalPages).toBe(3);
          expect(totalItems).toBe(6);
          expect(projects).toBeTruthy();
          expect(projects.length).toBe(2);
          const project = projects[0];
          expect(project.id).toBe(testProject.id);
          expect(project.name).toBe(testProject.name);
          expect(project.description).toBe(testProject.description);
          expect(project.createdOn).toBe(testProject.createdOn.toISOString());
          expect(project.updatedOn).toBe(testProject.updatedOn?.toISOString());

          expect(project.createdBy).toBeTruthy();
          expect(project.createdBy.username).toBe(testUser1.username);
          expect(project.createdBy.displayName).toBe(testUser1.displayName);

          expect(project.updatedBy).toBeTruthy();
          expect(project.updatedBy.username).toBe(testUser2.username);
          expect(project.updatedBy.displayName).toBe(testUser2.displayName);
          done();
        });
    });
  });
});
