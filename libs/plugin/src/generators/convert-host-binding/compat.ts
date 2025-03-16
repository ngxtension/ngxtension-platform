import { convertNxGenerator } from '@nx/devkit';
import { convertHostBindingGenerator } from './generator';

export default convertNxGenerator(convertHostBindingGenerator);
