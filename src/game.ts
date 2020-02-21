
import {
  swatchZUnselected,
  swatchScale,
  Swatch,
  swatches,
  GrowSwatches
} from './modules/swatches'
import {
  Pixel,
  pixels,
  CheckServer,
  getFromServer,
  wallPixelTransparentMaterial,
  wallPixelColorMaterial
} from './modules/pixels'
import { apiUrl, refreshInterval, swatchColors, wallBlocksX, wallBlocksY, wallWidth, wallHeight, wallPixelZ, wallPixelScale, paletteColor, wallOffsetX, wallOffsetY, blankColor,headers } from "./params";


const _scene = new Entity('_scene')
engine.addEntity(_scene)
const transform = new Transform({
  position: new Vector3(0, 0, 0),
  rotation: new Quaternion(0, 0, 0, 1),
  scale: new Vector3(1, 1, 1)
})


// PIXEL ART CENTRES

import {PixelInstance} from './pixelinstance'

const station1 = new PixelInstance("https://lemursiv3.stayl.it",new Vector3(2.50196838378906, 0.62319021224975586, 1.0679702758789),new Quaternion(-1.5394153601527394e-15, 1.1571068286895752, 8.429369557916289e-8, 0.7071068286895752))
//const station2 = new PixelInstance("https://lemursiv3.stayl.it",new Vector3(33.67498016357422, 3.8667573928833008, 44.63134765625),new Quaternion(4.1924393356208107e-16, -0.28275349736213684, 3.370685419668007e-8, 0.95919269323349))



