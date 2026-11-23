import { httpRouter } from 'convex/server'
import { linq } from './features/feedback/linq'

const http = httpRouter()
// POST <CONVEX_SITE_URL>/linq/webhook
linq.registerRoutes(http)
export default http
