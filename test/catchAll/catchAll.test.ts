import { TestHelper } from '../utils';
import { ErrorTypes } from '../../src/server/utils/configureResponseHandlers';
import request from 'supertest';
const testHelper = new TestHelper();
const serverUrl = testHelper.getServerUrl();
const apiRoute = '/somethingThatDoesntExist';

describe('Catch All Route', () => {
  describe(`ALL ${apiRoute}`, () => {
    it('should reject requests for routes that do not exist', (done) => {
      request(serverUrl).get(apiRoute).expect(
        404,
        {
          error: 'API route not found',
          errorType: ErrorTypes.NOT_FOUND,
        },
        done,
      );
    });
  });
});
