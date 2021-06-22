import { IApi } from "../interface/IApi";
import { IData } from "../interface/IData";

class ApiService implements IApi {
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