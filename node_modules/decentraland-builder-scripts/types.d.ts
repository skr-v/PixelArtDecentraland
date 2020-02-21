declare interface IScript<T extends {}> {
  init(args: { inventory: IInventory }): void
  spawn(host: any, props: T, channel: IChannel): void
}

type BaseAction<T extends {}> = {
  entityName: string
  actionId: string
  values: T
}

declare type Actions = BaseAction<any>[]

declare type Action<T> = BaseAction<T> & {
  sender: string
}

type Bus = {
  emit: (event: string, payload: any) => any
  on: (event: string, fn: (...args: any[]) => any) => any
}

declare interface IChannel {
  id: string
  bus: Bus
  createAction<T extends {}>(actionId: string, values: T): BaseAction<T>
  sendActions(actions?: Actions): void
  handleAction<T extends {}>(
    actionId: string,
    handler: (action: Action<T>) => void
  ): void
  request<T>(key: string, callback: (value: T) => void): void
  reply<T>(key: string, callback: () => T): void
}

declare interface IInventory {
  add(id: string, texture: any): void
  has(id: string): boolean
  remove(id: string): void
}
