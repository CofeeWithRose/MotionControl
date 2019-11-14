import Koa, { ParameterizedContext } from 'koa'
import koaStatic from 'koa-static'
import path from 'path'
import koaSslify from 'koa-sslify'
import https from 'https'
import http from 'http'
import fs, { Stats } from 'fs'
import { sslKeyPath, sslCrtPath } from '../config/paths'

const app = new Koa()
const pwd = process.env.PWD||''
const staticPath = path.resolve(pwd,'static')
app.use(koaSslify())
app.use(koaStatic(staticPath, {
  setHeaders: (res: ParameterizedContext["res"], path: string, stats: Stats) =>{
    if(!/\/static\/(index|manifest)/.test(path)){
      res.setHeader('Cache-Control','max-age=315360000')
    }
  }
}))

const options = {
  key: fs.readFileSync(sslKeyPath),
  cert: fs.readFileSync(sslCrtPath)
};
export function start(){

http.createServer(app.callback()).listen(80);
https.createServer(options, app.callback()).listen(443);

}
