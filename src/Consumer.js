import axios from 'axios'
import { format } from 'url'

export default class Consumer {
  constructor (opts = {}) {
    const { port = 3000, hostname = 'localhost' } = opts

    this.baseUrl = format({
      protocol: 'http',
      hostname,
      port
    })
  }

  getNextMessage () {
    const url = `${this.baseUrl}/message/next`
    return axios.get(url)
      .then(({ data }) => data)
  }

  notifyProcessed (id) {
    const url = `${this.baseUrl}/message/${id}/status/done`
    return axios.post(url)
      .then(({ data = {} }) => data.status === 'processed')
  }
}
