import request from '@/utils/request'

// 查询部门列表
export const queryAllApi = () => request.get('/depts')