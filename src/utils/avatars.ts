/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Import the user-provided original avatar PNG images directly
import avatarHombre1 from '../assets/images/avatar_hombre_1.png';
import avatarHombre2 from '../assets/images/avatar_hombre_2.png';
import avatarJoven1 from '../assets/images/avatar_joven_1.png';
import avatarJoven2 from '../assets/images/avatar_joven_2.png';
import avatarMujer1 from '../assets/images/avatar_mujer_1.png';
import avatarMujer2 from '../assets/images/avatar_mujer_2.png';
import avatarNino1 from '../assets/images/avatar_niño_1.png';
import avatarNino2 from '../assets/images/avatar_niño_2.png';

// Assign the PNG assets to the avatar constants
export const AVATAR_FELIX = avatarHombre1;
export const AVATAR_SOFIA = avatarMujer1;
export const AVATAR_MATEO = avatarHombre2;
export const AVATAR_CAMILA = avatarMujer2;
export const AVATAR_DIEGO = avatarJoven1;
export const AVATAR_ELENA = avatarJoven2;
export const AVATAR_BOY = avatarNino1;
export const AVATAR_GIRL = avatarNino2;

// Combined list to match PRESET_AVATARS exactly
export const LIST_AVATARS = [
  { name: 'Felix', url: AVATAR_FELIX },
  { name: 'Sofia', url: AVATAR_SOFIA },
  { name: 'Mateo', url: AVATAR_MATEO },
  { name: 'Camila', url: AVATAR_CAMILA },
  { name: 'Diego', url: AVATAR_DIEGO },
  { name: 'Elena', url: AVATAR_ELENA },
  { name: 'Javier', url: AVATAR_BOY },
  { name: 'Isabela', url: AVATAR_GIRL }
];
