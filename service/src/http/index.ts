import Koa from 'koa'
import koaStatic from 'koa-static'
import path from 'path'
import koaSslify from 'koa-sslify'
import https from 'https'
import http from 'http'
import fs from 'fs'

const app = new Koa()
const pwd = process.env.PWD||''
const staticPath = path.resolve(pwd,'static')
app.use(koaSslify())
app.use(koaStatic(staticPath))

const keyPath = path.resolve(pwd, 'ssl/ssl.key')
const cerPath = path.resolve(pwd, 'ssl/ssl.crt')
const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(cerPath)
};
export function start(){

http.createServer(app.callback()).listen(80);
https.createServer(options, app.callback()).listen(443);

}
