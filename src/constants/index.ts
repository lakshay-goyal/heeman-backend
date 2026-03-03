export { aboutConstants } from './about';
export { contactConstants } from './contact';
export { landingConstants } from './landing';

import { aboutConstants } from './about';
import { contactConstants } from './contact';
import { landingConstants } from './landing';

export const defaultConstants: Record<string, any> = {
    aboutConstants,
    contactConstants,
    landingConstants
};
