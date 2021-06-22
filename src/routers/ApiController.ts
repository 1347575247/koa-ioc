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