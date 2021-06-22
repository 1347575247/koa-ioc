import { route, GET } from 'awilix-koa'
import { Context } from '../interface/IKoa'

@route('/')
class ApiController {

  @route('/')
  @GET()
  async actionList(ctx: Context) : Promise<any> {
    ctx.render('index', {
      data: 'hhh'
    })
  }
}

export default ApiController