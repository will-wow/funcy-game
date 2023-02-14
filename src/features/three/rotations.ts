import { Euler } from "three";

export const NINETY_DEGREES = Math.PI / 2;
export const FORTY_FIVE_DEGREES = Math.PI / 4;

export const EULER_45_Y = new Euler(0, FORTY_FIVE_DEGREES, 0);

export const EULER_NEGATIVE_90_X = new Euler(NINETY_DEGREES, 0, 0);
export const EULER_180_X = new Euler(Math.PI, 0, 0);
export const EULER_90_X = new Euler(NINETY_DEGREES, 0, 0);
