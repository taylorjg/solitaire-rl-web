const express = require('express')
const history = require('connect-history-api-fallback')
const morgan = require('morgan')
const path = require('path')

const PORT = process.env.PORT || 3222
const BUILD_FOLDER = path.resolve(__dirname, '..', 'build')
const MODELS_FOLDER = path.resolve(__dirname, 'models')

const buildFolderSetHeaders = (res, _path, _stat) => {
  if (res.req.url.startsWith('/images')) {
    res.set('Cache-Control', `public, max-age=${60 * 60 * 24 * 365}`)
  }
}

const main = () => {
  const app = express()
  app.use(morgan('dev'))
  app.use(history())
  app.use(express.static(BUILD_FOLDER, { setHeaders: buildFolderSetHeaders }))
  app.use('/models', express.static(MODELS_FOLDER))
  app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))
}

main()
