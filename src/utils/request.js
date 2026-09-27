import axios from 'axios'
import router from '@/router'

//创建axios实例对象
const request = axios.create({
  baseURL: '/api',
  timeout: 600000
})

//axios的请求 request 拦截器
request.interceptors.request.use(
  (config) => {
    const loginUserString = localStorage.getItem('loginUser')
    const loginUser = JSON.parse(loginUserString)
    if(loginUser && loginUser.token) {
      config.headers.token = loginUser.token
    }
    return config
  },
  (error) => { //失败回调
    return Promise.reject(error)
  }
)

//axios的响应 response 拦截器
request.interceptors.response.use(
  (response) => { //成功回调
    return response.data
  },
  (error) => { //失败回调
    // 处理401错误
    if(error.response.status === 401) {
      // 清除token
      localStorage.removeItem('loginUser')
      // 跳转到登录页
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default request