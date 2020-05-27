'use strict'

const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  API_URL: '"https://cms-websites-v1.dev.acentera/api"',
  DOMAIN: "'acentera'",
  BADAPI_URL: '"https://api-websites-v1.dev.acentera/api"',
  IS_WEBSITE_DEV: true
})
