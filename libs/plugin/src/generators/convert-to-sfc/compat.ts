import { convertNxGenerator } from '@nx/devkit';
import convertGenerator from './generator';

export default convertNxGenerator(convertGenerator);
