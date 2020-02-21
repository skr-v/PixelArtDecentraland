/// <reference path="./types.d.ts" />

export function createInventory(
  UICanvas: any,
  UIContainerStack: any,
  UIImage: any
): IInventory {
  let canvas: any = null
  let container: any = null
  let images: Record<string, any> = {}

  function getContainer() {
    if (!canvas) {
      canvas = new UICanvas()
    }
    if (!container) {
      container = new UIContainerStack(canvas)
      container.isPointerBlocker = false
      container.vAlign = 'bottom'
      container.hAlign = 'right'
      container.stackOrientation = 0
      container.spacing = 0
      container.positionY = 75
      container.positionX = -25
    }
    return container
  }

  return {
    add(id: string, texture: any) {
      const image = images[id] || new UIImage(getContainer(), texture)
      image.width = 128
      image.height = 128
      image.sourceTop = 0
      image.sourceLeft = 0
      image.sourceHeight = 256
      image.sourceWidth = 256
      image.isPointerBlocker = false
      image.visible = true
      images[id] = image
    },

    remove(id: string) {
      const image = images[id]
      if (image) {
        image.visible = false
        image.height = 0
        image.width = 0
      }
    },

    has(id: string) {
      return id in images && images[id].visible
    }
  }
}
