import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/errors';
import request from 'supertest';
import { User, Project } from '../../src/models';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
const apiRoute = '/projects';

describe('Project Create', () => {
  describe(`POST ${apiRoute}`, () => {
    let authenticatedUser: User;
    let authToken: string;
    let payload: {
      name: unknown;
      description: unknown;
    };

    beforeAll(async () => {
      authenticatedUser = await testHelper.createTestUser();
      authToken = testHelper.generateToken(authenticatedUser);
    });

    afterAll(async () => {
      await testHelper.removeTestData();
    });

    beforeEach(() => {
      payload = {
        name: 'Unit Test Project 1',
        description: 'This project was generated via automated testing.',
      };
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

    it('should reject requests when name is missing', (done) => {
      payload.name = undefined;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'name is missing from input',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when name is not a string', (done) => {
      payload.name = { iAm: 'notAString' };
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'name must be a string',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when name is less than 3 characters', (done) => {
      payload.name = 'a';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'name must be 3 - 30 characters in length',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when name is more than 30 characters', (done) => {
      payload.name = Array(31).fill('a').join('');
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'name must be 3 - 30 characters in length',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when name contains invalid characters', (done) => {
      payload.name = '👍👍👍';
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'name contains invalid characters',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when description is not a string', (done) => {
      payload.description = false;
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'description must be a string',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should reject requests when description is more than 350 characters', (done) => {
      payload.description = Array(351).fill('b').join('');
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(
          400,
          {
            error: 'description must be 350 characters or less',
            errorType: ErrorTypes.VALIDATION,
          },
          done,
        );
    });

    it('should successfully create a project', (done) => {
      request(serverUrl)
        .post(apiRoute)
        .set('x-auth-token', authToken)
        .send(payload)
        .expect(200)
        .end(async (err, res) => {
          if (err) {
            return done(err);
          }
          const { message, project } = res.body;

          // Ensure the project was actually created
          const createdProject = await Project.findOne({
            where: {
              id: project.id,
              isActive: true,
            },
          });
          if (!createdProject) {
            return done('created project was not found in database');
          }

          expect(message).toBe('project has been successfully created');
          expect(project).toEqual({
            id: createdProject.id,
            name: payload.name,
            description: payload.description,
            createdOn: createdProject.createdOn.toISOString(),
            createdBy: {
              username: authenticatedUser.username,
              displayName: authenticatedUser.displayName,
            },
          });
          expect(createdProject.createdById).toBe(authenticatedUser.id);
          expect(createdProject.name).toBe(payload.name);
          expect(createdProject.description).toBe(payload.description);

          // Ensure an admin membership was created for the user that created the project
          const membership = (
            await createdProject.getMemberships({
              where: { userId: authenticatedUser.id },
            })
          )[0];
          if (!membership) {
            return done('created project membership was not found in database');
          }
          expect(membership.id).toBeTruthy();
          expect(membership.createdOn).toBeTruthy();
          expect(membership.isProjectAdmin).toBe(true);
          expect(membership.isProjectManager).toBe(false);
          expect(membership.createdById).toBe(authenticatedUser.id);

          testHelper.addTestProjectId(project.id);
          done();
        });
    });
  });
});
