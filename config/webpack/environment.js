const { environment } = require('@rails/webpacker')
const credentials = require('./loaders/credentials')

environment.loaders.prepend('credentials', credentials)

module.exports = environment
