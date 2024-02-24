import { ValidationError } from 'src/server/utils/errors';

type ValidateId = (reqParamId: string, paramName: string) => void;

const validateId: ValidateId = (reqParamId, paramName) => {
  // Ids should be UUIDv4, Found this regex online for validating UUIDv4
  const uuidRegex =
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
  if (!uuidRegex.test(reqParamId)) {
    throw new ValidationError(`requested ${paramName} id is not valid`);
  }
};

export default validateId;
