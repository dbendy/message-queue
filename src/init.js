#!/usr/bin/env node
import createServer from './server'
import config from 'config'

const server = createServer(config)

if (!module.parent) {
  server.run()
}

export default server
