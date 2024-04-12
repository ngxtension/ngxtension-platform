import { convertNxGenerator } from '@nx/devkit';
import convertDiToInjectGenerator from './generator';

export default convertNxGenerator(convertDiToInjectGenerator);
