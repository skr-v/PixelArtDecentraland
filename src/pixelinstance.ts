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
import {
  refreshInterval,
  swatchColors,
  wallBlocksX,
  wallBlocksX2,
  wallBlocksY,
  wallBlocksY2,
  wallWidth,
  wallHeight,
  wallPixelZ,
  wallPixelScale,
  paletteColor,
  wallOffsetX,
  wallOffsetY,
  blankColor,
  apiUrl
} from './params'

export class PixelInstance extends Entity{
  
  // initiate timer to update wall from server regularly
  refreshTimer: number = refreshInterval

  currentColor: Material = wallPixelTransparentMaterial

/*

An [x] icon shows on the palette. This is that texture material.

*/

/*

There are two materials used for the wall:
+ wallPixelColorMaterial - opaque material which is the background for colors
+ wallPixelTransparentMaterial - transparent material used for no color

*/

transparentTexture = new Texture('textures/transparent-texture.png')
transparentMaterial = new BasicMaterial()
station:string
playerAddress:string

  constructor(station:string, position:Vector3, rotation:Quaternion){

    super()
    this.station = station
    this.addComponent(new Transform({
      position: position,
      rotation: rotation,
      scale: Vector3.One()
    }))
    engine.addEntity(this)
    log("creating pixel station " + station)

    this.transparentMaterial.texture = this.transparentTexture
        // Add systems to engine
    engine.addSystem(new GrowSwatches())

    engine.addSystem(new CheckServer(this.refreshTimer, this.station))

    ////// ENVIRONMENT

    this.InitiateWall()
    this.InitiatePalette()
    getFromServer(this.station)
  }

updatePlayerAddress(address:string)
  {
    this.playerAddress = address
//log('Player address in pixelinstance ' + this.playerAddress)
  }

  // lay out all wall pixels
InitiateWall() {
  for (let xIndex = 0; xIndex < wallBlocksX; xIndex += 1) {
    for (let yIndex = 0; yIndex < wallBlocksY; yIndex += 1) {
      const xPos = (wallWidth / wallBlocksX) * xIndex + wallOffsetX
      const yPos = (wallHeight / wallBlocksY) * yIndex + wallOffsetY

      let pix = new Entity()
      pix.addComponent(
        new Transform({
          position: new Vector3(xPos, yPos, wallPixelZ),
          scale: wallPixelScale
        })
      )
      pix.addComponent(new Pixel(xIndex, yIndex))

      pix.addComponent(wallPixelTransparentMaterial)
      pix.addComponent(new PlaneShape())
      pix.addComponent(
        new OnPointerDown(
          e => {
            this.clickPixel(pix)
          },
          { button: ActionButton.POINTER, hoverText: 'Paint' }
        )
      )
      pix.setParent(this)
      engine.addEntity(pix)
    }
  }
}

// lay out swatches in the palette
InitiatePalette() {
  let paletteContainer = new Entity()
  paletteContainer.addComponent(
    new Transform({
      position: new Vector3(8.5, 1, 3),
      rotation: Quaternion.Euler(0, 50, 0)
    })
  )
  paletteContainer.setParent(this)
  engine.addEntity(paletteContainer)

  let palette = new Entity()
  palette.setParent(paletteContainer)
  palette.addComponent(
    new Transform({
      scale: new Vector3(2.2, 1, 1)
    })
  )
  palette.addComponent(new PlaneShape())
  palette.addComponent(wallPixelColorMaterial[paletteColor])
  engine.addEntity(palette)
  let rowY = 0
  for (let i = 0; i < swatchColors.length; i++) {
    const x = ((i % 12) + 1) / 6 - 1.08
    if (i % 12 === 0) {
      rowY -= 0.17
    }
    const y = rowY + 0.5

    let colorOption = new Entity()
    colorOption.setParent(paletteContainer)
    colorOption.addComponent(
      new Transform({
        position: new Vector3(x, y, swatchZUnselected),
        scale: swatchScale
      })
    )
    colorOption.addComponent(new Swatch(x, y))
    //log(wallPixelColorMaterial[i].albedoColor)
    if (i == 0) {
      colorOption.addComponent(this.transparentMaterial)
    } else {
      let col = swatchColors[i]
      colorOption.addComponent(wallPixelColorMaterial[col])
    }

    colorOption.addComponent(new PlaneShape())
    colorOption.addComponent(
      new OnPointerDown(
        e => {
          log("we got here")
          this.clickSwatch(colorOption)
        },
        { button: ActionButton.POINTER, hoverText: 'Pick Color' }
      )
    )
    //colorOption.setParent(palette)
    engine.addEntity(colorOption)
  }
}

// when a swatch is clicked set color as active color
clickSwatch(colorOption: IEntity) {
  // inactivate all options
  for (let swatch of swatches.entities) {
    swatch.getComponent(Swatch).active = false
  }
  // activate clicked
  colorOption.getComponent(Swatch).active = true
  // set painting color
  this.currentColor = colorOption.getComponent(Material)
  log('clicked color in the palette')
}

// when a pixel is clicked, send data to server
clickPixel(pix: Entity) {
  //pix.set(currentColor)
  log('setting color to pixel')

  let x = pix.getComponent(Pixel).x
  let y = pix.getComponent(Pixel).y
  let color
  if (this.currentColor.albedoColor) {
    color = this.currentColor.albedoColor.toHexString()
  } else {
    // transparent
    color = null
  }

  // set the pixel color locally first
  if (color) {
    if (wallPixelColorMaterial[color]){ 
      let newMaterial = wallPixelColorMaterial[color]
      pix.removeComponent(Material)
      pix.addComponentOrReplace(newMaterial)
    } else {
      log("pixel color" + color + " not supported on " + x + " & " + y)
    }   

  } else {
    pix.removeComponent(Material)
    pix.addComponentOrReplace(wallPixelTransparentMaterial)
  }

  
  // then post the data to the server
  let url = `${this.station}/api/pixels/pixel`
  let method = 'POST'
  let headers = { 'Content-Type': 'application/json' }
  let body = JSON.stringify({ x: x, y: y, color: color, address:this.playerAddress })
 // log('body logged as ' + body)
  executeTask(async () => {
    try {
      let response = await fetch(url, {
        headers: headers,
        method: method,
        body: body
      })
    } catch {
      log('error sending pixel change')
    }
  })

}

}

