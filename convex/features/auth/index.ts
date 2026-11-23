import { publicApi } from './public'
import { setupApi } from './setup'

export const authApi = { ...setupApi, ...publicApi }
