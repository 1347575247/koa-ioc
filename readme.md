# Ts+IOC

传统的mvc模式是这样子的

![img](https://gitee.com/cai-lunduo/static-resource-warehouse/raw/master/static/ts-awilix/mvc.png)

而IOC会将路由路由以及控制器都放到一个容器统一管理，也就是这样

![img](https://gitee.com/cai-lunduo/static-resource-warehouse/raw/master/static/ts-awilix/ioc.png)

ioc的思想最核心的地方在于，资源不由使用资源的双方管理，而由不使用资源的第三方管理，这可以带来很多好处。第一，资源集中管理，实现资源的可配置和易管理。第二，降低了使用资源双方的依赖程度，也就是我们说的耦合度。

也就是说，甲方要达成某种目的不需要直接依赖乙方，它只需要达到的目的告诉第三方机构就可以了，比如甲方需要一双袜子，而乙方它卖一双袜子，它要把袜子卖出去，并不需要自己去直接找到一个卖家来完成袜子的卖出。它也只需要找第三方，告诉别人我要卖一双袜子。这下好了，甲乙双方进行交易活动，都不需要自己直接去找卖家，相当于程序内部开放接口，卖家由第三方作为参数传入。甲乙互相不依赖，而且只有在进行交易活动的时候，甲才和乙产生联系。反之亦然。这样做什么好处么呢，甲乙可以在对方不真实存在的情况下独立存在，而且保证不交易时候无联系，想交易的时候可以很容易的产生联系。甲乙交易活动不需要双方见面，避免了双方的互不信任造成交易失败的问题。因为交易由第三方来负责联系，而且甲乙都认为第三方可靠。那么交易就能很可靠很灵活的产生和进行了。

这就是ioc的核心思想。生活中这种例子比比皆是，支付宝在整个淘宝体系里就是庞大的ioc容器，交易双方之外的第三方，提供可靠性可依赖可灵活变更交易方的资源管理中心。另外人事代理也是，雇佣机构和个人之外的第三方。

在以上的描述中，诞生了两个专业词汇，依赖注入和控制反转
所谓的依赖注入，则是，甲方开放接口，在它需要的时候，能够讲乙方传递进来(注入)
所谓的控制反转，甲乙双方不相互依赖，交易活动的进行不依赖于甲乙任何一方，整个活动的进行由第三方负责管理。

## ts+node+koa+awilix实现IOC

### 介绍

**awilix**:  用TypeScript编写的用于JavaScript/Node的极其强大的依赖注入（DI）容器

**ts**: TypeScript是一种用于应用程序级JavaScript的语言。TypeScript为JavaScript添加了可选类型，这些类型支持针对任何浏览器、任何主机、任何操作系统的大规模JavaScript应用程序的工具。TypeScript编译成可读的、基于标准的JavaScript。

**node**: Node.js 是一个开源与跨平台的 JavaScript 运行时环境。

**koa**: nodeJS的一个框架，Koa的中间件堆栈以类似堆栈的方式流动，允许您在下游执行操作，然后在上游过滤和操作响应，且Koa没有与任何中间件捆绑在一起。

### 流程

目录结构为

```
│ app.ts
│ tree.txt
│ 
├─interface
│   IApi.ts
│   IData.ts
│   IKoa.ts
│   
├─routers
│   ApiController.ts
│   IndexController.ts
│   
├─service
│   ApiService.ts
│   
├─typings
│   koa-art-template.d.ts
│   
└─views
    index.html
```

首先我们可以先通过awilix创建一个容器，该容器负责装载我们的service

```ts
const container = createContainer()
```

服务都放在service下，负责数据请求或修改等操作

```ts
container.loadModules([`${__dirname}/service/*.ts`], {
  formatName: 'camelCase',
  resolverOptions: {
    // 指定每次都创建一个新类
    lifetime: Lifetime.SCOPED
  }
})
```

我们这里的serivce模拟一下向后台请求数据，让其返回一个Promise对象，并对返回的Promise类型进行约束，也就是让Promise的对象约束为IData类型，IData类型是我们自定义的，除此之外我们还对了类进行了约束，让其实现IApi接口。

```ts
import { IApi } from "../interface/IApi";
import { IData } from "../interface/IData";

class ApiService implements IApi {
  // 请求数据
  getInfo() {
    return new Promise<IData>(resolve => {
      resolve({
        item: '后台的数据',
        dataList: [666, 'next']
      })
    })
  }
}

export default ApiService
```

IApi接口：用于约束service层的编写

```ts
import { IData } from "./IData";

export interface IApi {
  getInfo(): Promise<IData>
}
```

IData接口：用于约束返回值类型

```ts
export interface IData {
  item: string;
  dataList: Array<number | string>
}
```



Service层编写完毕之后，我们再来看看路由层怎么编写：

在以往的路由编写过程中，我们都需要编写一个个路由以及其对应的类，类与类之间相互独立，由此当类之间有共同的方法时，如打印日志；`oop（面向对象）`的设计让我们无法让这两个类联系，因此我们需要在每一个类中都编写一个打印日志方法，也许你会说：直接把那个方法给单独抽离出来不就可以了？可以是可以，但是两个类都依赖一这个抽离出来的方法时，两个类都对一个方法有了依赖，是不是耦合度就提升了？

而`AOP（面向切面）`的设计让我们可以在**代码运行时动态地将代码插入到类地指定方法中，指定位置上地编程思想就面向切面地编程。**

在下面，我们就是通过`高阶函数`的方式，这里用ES6的修饰器，当以`Get`的方式访问到`/api/list`时，实例化`ApiController`并以执行`actionList`函数，函数会调用`service`层的`getInfo`并返回`response`

```ts
import { route, GET } from 'awilix-koa'
import { IApi } from '../interface/IApi';
import Router from '@koa/router'


@route('/api')
class ApiController {
  private apiService: IApi;
  // 因为camelCase，所以ApiService => apiService
  constructor({apiService}: {apiService: IApi}) {
    this.apiService = apiService;
  }

  @route('/list')
  @GET()
  async actionList(ctx: Router.RouterContext) : Promise<any> {
    let data = await this.apiService.getInfo()
    ctx.response.body = {
      data
    }
  }
}

export default ApiController
```

最后我们在入口文件，还需要将IOC容器给注入到整个Koa运行流程之中，并通过`awilix-koa`的`loadControllers`，加载所有路由让app监听。

```ts
// app.ts
import { scopePerRequest, loadControllers } from 'awilix-koa'
。。。
app.use(scopePerRequest(container))
app.use(loadControllers(`${__dirname}/routers/*.ts`))
```



