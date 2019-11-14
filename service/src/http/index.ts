import Koa from 'koa'
import koaStatic from 'koa-static'
import path from 'path'
import koaSslify from 'koa-sslify'
import https from 'https'
import http from 'http'
import fs from 'fs'
import { sslKeyPath, sslCrtPath } from '../config/paths'

const app = new Koa()
const pwd = process.env.PWD||''
const staticPath = path.resolve(pwd,'static')
app.use(koaSslify())
app.use(koaStatic(staticPath))

const options = {
  key: fs.readFileSync(sslKeyPath),
  cert: fs.readFileSync(sslCrtPath)
};
export function start(){

http.createServer(app.callback()).listen(80);
https.createServer(options, app.callback()).listen(443);

}
