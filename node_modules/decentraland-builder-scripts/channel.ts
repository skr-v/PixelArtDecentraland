/// <reference path="./types.d.ts" />

type RequestMessage = {
  entityName: string
  key: string
  sender: string
}

type ReplyMessage = {
  entityName: string
  key: string
  sender: string
  value: string
}

const REQUEST_VALUE = '__request_value__'
const REPLY_VALUE = '__reply_value__'
const POLL_INTERVAL = 5000

declare var setInterval: any
declare var clearInterval: any

export function createChannel(id: string, host: any, bus: Bus): IChannel {
  const handlers: Record<string, (values: any) => void> = {}
  let requests: Record<string, (value: any) => void> = {}
  const responses: Record<string, () => any> = {}

  bus.on(host.name, (action: Action<any>) => {
    const handler = handlers[action.actionId]
    if (handler) {
      handler(action)
    }
    // clear all pending requests for this entity
    requests = {}
  })

  bus.on(REQUEST_VALUE, (message: RequestMessage) => {
    if (message.sender !== id && message.entityName === host.name) {
      const { key } = message
      const response = responses[key]
      if (response) {
        const value = response()
        const reply: ReplyMessage = {
          entityName: host.name,
          key,
          sender: id,
          value
        }
        bus.emit(REPLY_VALUE, reply)
      }
      // clear pending request for this key
      delete requests[key]
    }
  })

  bus.on(REPLY_VALUE, (message: ReplyMessage) => {
    if (message.sender !== id && message.entityName === host.name) {
      const { key, value } = message
      const request = requests[key]
      if (request) {
        request(value)
      }
      // clear pending request for this key
      delete requests[key]
    }
  })

  return {
    id,
    bus,
    createAction<T extends {}>(actionId: string, values: T) {
      const action: BaseAction<T> = {
        entityName: host.name,
        actionId,
        values
      }
      return action
    },
    sendActions(actions: Actions = []) {
      for (const base of actions) {
        const action: Action<any> = { ...base, sender: id }
        bus.emit(action.entityName, action)
      }
    },
    handleAction<T>(actionId: string, handler: (values: T) => void) {
      handlers[actionId] = handler
    },
    request<T>(key: string, callback: (value: T) => void) {
      requests[key] = callback
      const request: RequestMessage = { entityName: host.name, key, sender: id }
      const interval = setInterval(() => {
        if (key in requests) {
          bus.emit(REQUEST_VALUE, request)
        } else {
          clearInterval(interval)
        }
      }, POLL_INTERVAL)
    },
    reply<T>(key: string, callback: () => T) {
      responses[key] = callback
    }
  }
}
