import Koa from 'koa'
import {createContainer, Lifetime} from 'awilix'
import { scopePerRequest, loadControllers } from 'awilix-koa'
import render from 'koa-art-template'

import path from 'path'

const app = new Koa()

// 创建一个基础的容器，负责装载服务, 为IOC做准备
const container = createContainer()
container.loadModules([`${__dirname}/service/*.ts`], {
  formatName: 'camelCase',
  resolverOptions: {
    // 指定每次都创建一个新类
    lifetime: Lifetime.SCOPED
  }
})

// 把 container 注入到整个Koa的运行流程
app.use(scopePerRequest(container))

// 加载全部路由
app.use(loadControllers(`${__dirname}/routers/*.ts`))

render(app, {
  root: path.join(__dirname, 'views'),
  extname: '.html',
});

app.listen(8080, () => {
  console.log("litsening on port 8080")
})