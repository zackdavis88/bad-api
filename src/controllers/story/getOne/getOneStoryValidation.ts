import { validateId } from 'src/controllers/validationUtils';

type GetOneStoryValidation = (storyId: string) => void;

const getOneStoryValidation: GetOneStoryValidation = (storyId) => {
  validateId(storyId, 'story');
};

export default getOneStoryValidation;
