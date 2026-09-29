import { convertNxGenerator } from '@nx/devkit';
import update from './migrate-inject-lazy';

export default convertNxGenerator(update);
