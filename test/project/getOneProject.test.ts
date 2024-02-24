import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/errors';
import request from 'supertest';
import { User, Project } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
let apiRoute = '/projects/:projectId';

describe('Project GetOne', () => {
  describe(`GET ${apiRoute}`, () => {
    let authenticatedUser: User;
    let testUser1: User;
    let testUser2: User;
    let testProject: Project;
    let inactiveProject: Project;
    let authToken: string;

    beforeAll(async () => {
      authenticatedUser = await testHelper.createTestUser();
      testUser1 = await testHelper.createTestUser();
      testUser2 = await testHelper.createTestUser();

      testProject = await testHelper.createTestProject(
        testUser1,
        'unit test project',
        'this project was generated via automated testing.',
      );
      await testProject.createMembership({
        userId: testUser2.id,
        isProjectManager: true,
        createdById: testUser1.id,
      });
      testProject.updatedById = testUser2.id;
      testProject.updatedOn = new Date();
      await testProject.save();

      inactiveProject = await testHelper.createTestProject(authenticatedUser);
      inactiveProject.deletedOn = new Date();
      inactiveProject.deletedById = authenticatedUser.id;
      inactiveProject.isActive = false;
      await inactiveProject.save();

      authToken = testHelper.generateToken(authenticatedUser);
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      apiRoute = `/projects/${testProject.id}`;
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
      apiRoute = '/projects/somethingInvalid';
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
      apiRoute = `/projects/${testHelper.generateUUID()}`;
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
      apiRoute = `/projects/${inactiveProject.id}`;
      request(serverUrl).get(apiRoute).set('x-auth-token', authToken).expect(
        404,
        {
          error: 'requested project not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });

    it('should successfully retrieve project details', (done) => {
      request(serverUrl)
        .get(apiRoute)
        .set('x-auth-token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          const { message, project } = res.body;
          expect(message).toBe('project has been successfully retrieved');
          expect(project).toBeTruthy();
          expect(project.id).toBe(testProject.id);
          expect(project.name).toBe(testProject.name);
          expect(project.description).toBe(testProject.description);

          expect(project.createdOn).toBe(testProject.createdOn.toISOString());
          expect(project.createdBy).toBeTruthy();
          expect(project.createdBy.username).toBe(testUser1.username);
          expect(project.createdBy.displayName).toBe(testUser1.displayName);

          expect(project.updatedOn).toBe(testProject.updatedOn?.toISOString());
          expect(project.updatedBy).toBeTruthy();
          expect(project.updatedBy.username).toBe(testUser2.username);
          expect(project.updatedBy.displayName).toBe(testUser2.displayName);

          expect(project.membershipCount).toBe(2);
          done();
        });
    });
  });
});
