import axios from 'axios'
import { format } from 'url'

export default class Producer {
  constructor (opts = {}) {
    const { port = 3000, hostname = 'localhost' } = opts

    this.url = format({
      protocol: 'http',
      hostname,
      port,
      pathname: '/message/new'
    })
  }

  addNewMessage (payload) {
    return axios.post(this.url, { payload })
  }
}
