import { mainEntities } from './main-entities';
import { authEntities } from './auth-entities';

export const allEntities = {
  ...mainEntities,
  ...authEntities,
};
