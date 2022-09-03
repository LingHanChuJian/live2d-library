import mitt, { Emitter } from 'mitt'

export type Events = {
    message: string
}

export const emitter: Emitter<Events> = mitt<Events>()

