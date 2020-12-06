const express = require('express')
const morgan = require('morgan')
const path = require('path')

const PORT = process.env.PORT || 3222
const BUILD_FOLDER = path.resolve(__dirname, '..', 'build')
const MODELS_FOLDER = path.resolve(__dirname, 'models')

const main = () => {
  const app = express()
  app.use(morgan('dev'))
  app.use(express.static(BUILD_FOLDER))
  app.use('/models', express.static(MODELS_FOLDER))
  app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))
}

main()
