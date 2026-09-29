import request from '@/utils/request'

// 根据分页查询班级列表
export const queryByPageApi = (name, begin, end, page, pageSize) => 
    request.get(`/clazzs?name=${name}&begin=${begin}&end=${end}&page=${page}&pageSize=${pageSize}`)
