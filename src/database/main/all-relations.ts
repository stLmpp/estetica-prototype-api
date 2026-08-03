import { authRelations } from './auth-relations';
import { mainRelations } from './main-relations';

export const allRelations = Object.assign(mainRelations, authRelations);