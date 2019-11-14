import path from 'path'
const pwd = process.env.PWD||''
export const  resolveApp = (relativePath: string) => path.resolve(pwd,relativePath)
export const sslKeyPath =  resolveApp('../ssl/ssl.key')
export const sslCrtPath =  resolveApp('../ssl/ssl.crt')