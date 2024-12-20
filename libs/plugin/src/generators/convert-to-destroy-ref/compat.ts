import { convertNxGenerator } from '@nx/devkit';
import convertToDestroyRefGenerator from './generator';

export default convertNxGenerator(convertToDestroyRefGenerator);
