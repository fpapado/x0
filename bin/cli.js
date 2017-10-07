#!/usr/bin/env node
const path = require('path')
const meow = require('meow')
const { pkg } = require('read-pkg-up').sync()
const open = require('opn')

const x0Pkg = require('../package.json')

require('update-notifier')({ pkg: x0Pkg }).notify()

const cli = meow(`
  Usage:

    $ x0 dev src/App.js

    $ x0 build src/App.js

  Options:

    -d --out-dir  Output directory for static build

    -s --static   Render static HTML without client-side JS

    -p --port     Port for dev server

    -o --open     Open dev server in default browser

`, {
  alias: {
    d: 'outDir',
    s: 'static',
    p: 'port',
    o: 'open',
  }
})

const [ cmd, file ] = cli.input
const options = Object.assign({}, pkg.x0, cli.flags)

const absolute = f => f
  ? path.isAbsolute(f) ? f : path.join(process.cwd(), f)
  : null

const filename = absolute(file)

switch (cmd) {
  case 'dev':
    let opened = false
    const dev = require('../lib/dev')
    dev(filename, options, (err, port) => {
      console.log(`Development server listening at http://localhost:${port}`)
      if (!opened && options.open) {
        open(`http://localhost:${port}`)
        opened = true
      }
    })
    break
  case 'build':
    const build = require('../lib/static')
    build(filename, options, (err, html) => {
      if (err) {
        console.log('Error')
        console.log(err)
        process.exit(1)
      }
      if (!options.outDir) {
        console.log(html)
      } else {
        console.log(`Static page rendered to ${options.outDir}`)
      }
    })
    break
  default:
    process.exit(0)
}
