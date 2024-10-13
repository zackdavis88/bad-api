import { validateId } from 'src/controllers/validationUtils';

type GetOneStatusValidation = (statusId: string) => void;

const getOneStatusValidation: GetOneStatusValidation = (statusId) => {
  validateId(statusId, 'status');
};

export default getOneStatusValidation;
