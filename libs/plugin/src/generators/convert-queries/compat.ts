import { convertNxGenerator } from '@nx/devkit';
import convertQueriesGenerator from './generator';

export default convertNxGenerator(convertQueriesGenerator);
