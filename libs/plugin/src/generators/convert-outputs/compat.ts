import { convertNxGenerator } from '@nx/devkit';
import convertOutputsGenerator from './generator';

export default convertNxGenerator(convertOutputsGenerator);
