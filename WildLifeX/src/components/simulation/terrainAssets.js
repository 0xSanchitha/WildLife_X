// terrainAssets.js

// -- Land Assets --
import flower1 from '../../assets/Land/Flowers/1.png';
import flower2 from '../../assets/Land/Flowers/2.png';
import flower3 from '../../assets/Land/Flowers/3.png';
import flower4 from '../../assets/Land/Flowers/4.png';
import flower5 from '../../assets/Land/Flowers/5.png';
import flower6 from '../../assets/Land/Flowers/6.png';
import flower7 from '../../assets/Land/Flowers/7.png';
import flower8 from '../../assets/Land/Flowers/8.png';
import flower9 from '../../assets/Land/Flowers/9.png';
import flower10 from '../../assets/Land/Flowers/10.png';
import flower11 from '../../assets/Land/Flowers/11.png';
import flower12 from '../../assets/Land/Flowers/12.png';
import flower13 from '../../assets/Land/Flowers/13.png';
import flower14 from '../../assets/Land/Flowers/14.png';

import bush1 from '../../assets/Land/Bush/1.png';
import bush2 from '../../assets/Land/Bush/2.png';
import bush3 from '../../assets/Land/Bush/3.png';
import bush4 from '../../assets/Land/Bush/4.png';

import trees1 from '../../assets/Land/Trees/1.png';
import trees2 from '../../assets/Land/Trees/2.png';
import trees3 from '../../assets/Land/Trees/3.png';

import rocks1 from '../../assets/Land/Rocks/1.png';
import rocks2 from '../../assets/Land/Rocks/2.png';
import rocks3 from '../../assets/Land/Rocks/3.png';

import caveImg from '../../assets/Land/Cave/1.png';
import grassImg from '../../assets/Land/Grass/1.png';
import mountainImg from '../../assets/Land/Mountain/1.png';
import pondImg from '../../assets/Land/pond/1.png';

// -- Ocean Assets --
import coral1 from '../../assets/Ocean/coral/1.png';
import coral2 from '../../assets/Ocean/coral/2.png';
import coral3 from '../../assets/Ocean/coral/3.png';
import coral4 from '../../assets/Ocean/coral/4.png';

import reefRock1 from '../../assets/Ocean/reef rock/1.png';
import reefRock2 from '../../assets/Ocean/reef rock/2.png';

import kelpImg from '../../assets/Ocean/Kelp/1.png';
import seaweedImg from '../../assets/Ocean/Seaweed/1.png';


export const FLOWER_VARIANTS = [flower1, flower2, flower3, flower4, flower5, flower6, flower7, flower8, flower9, flower10, flower11, flower12, flower13, flower14];
export const BUSH_VARIANTS = [bush1, bush2, bush3, bush4];
export const TREES_VARIANTS = [trees1, trees2, trees3];
export const ROCK_VARIANTS = [rocks1, rocks2, rocks3];

export const CORAL_VARIANTS = [coral1, coral2, coral3, coral4];
export const REEF_ROCK_VARIANTS = [reefRock1, reefRock2];

export const CAVE_IMG = caveImg;
export const GRASS_IMG = grassImg;
export const MOUNTAIN_IMG = mountainImg;
export const POND_IMG = pondImg;
export const KELP_IMG = kelpImg;
export const SEAWEED_IMG = seaweedImg;

export function getRandomVariant(variants) {
  return variants[Math.floor(Math.random() * variants.length)];
}

export const TERRAIN_SIZE = {
  // Land
  mountain: { w: 220, h: 190 },
  trees:    { w: 95,  h: 140 },
  pond:     { w: 150, h: 95  },
  cave:     { w: 120, h: 95  },
  bush:     { w: 55,  h: 50  },
  rock:     { w: 40,  h: 34  },
  flower:   { w: 18,  h: 18  },

  // Ocean
  reefRock: { w: 100, h: 68  },
  coral:    { w: 62,  h: 55  },
  kelp:     { w: 45,  h: 95  },
  seaweed:  { w: 28,  h: 48  },
};
