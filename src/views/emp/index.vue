<script setup>
import { ref, watch, onMounted } from 'vue'
import { queryPageApi, addApi, queryByIdApi, updateApi, deleteApi } from '@/api/emp'
import { queryAllApi as queryAllDeptApi } from '@/api/dept'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索参数
const searchEmp = ref({
  user: '',
  gender: '',
  date: [],
  beginDate: '',
  endDate: ''
})

// token
const token = ref('')

// 获取token
const getToken = () => {
  const loginUserString = localStorage.getItem('loginUser')
  const loginUser = JSON.parse(loginUserString)
  if(loginUser && loginUser.token) {
    token.value = loginUser.token
  }
}

//职位列表数据
const jobs = ref([{ name: '班主任', value: 1 },{ name: '讲师', value: 2 },{ name: '学工主管', value: 3 },{ name: '教研主管', value: 4 },{ name: '咨询师', value: 5 },{ name: '其他', value: 6 }])
//性别列表数据
const genders = ref([{ name: '男', value: 1 }, { name: '女', value: 2 }])
//部门列表数据
const deptList = ref([])

// 分页参数
const currentPage = ref(1) // 当前页码
const pageSize = ref(10) // 每页显示数量
const background = ref(true)
const total = ref(0)

// 选中的行数据
const selectedRows = ref([])

// 分页条事件：每页显示数量改变
const handleSizeChange = (val) => {
  search()
}
// 分页条事件：当前页码改变
const handleCurrentChange = (val) => {
  search()
}

// 组件挂载时查询员工列表
onMounted(async () => {
  getToken()
  search()
  //加载所有部门数据
  const result = await queryAllDeptApi();
  if (result.code) {
    deptList.value = result.data
  } else {
    ElMessage.error(result.msg)
  }
})

// 查询员工列表
const search = async () => {
  const res = await queryPageApi(searchEmp.value.user, searchEmp.value.gender, 
  searchEmp.value.beginDate, searchEmp.value.endDate, currentPage.value, pageSize.value)
  if (res.code) {
    empList.value = res.data.rows
    total.value = res.data.total
  } else {
    ElMessage.error(res.msg)
  }
}

// 清空
const clear = () => {
  searchEmp.value = {user: '',gender: '', date: [], beginDate: '',endDate: ''}
  search()
}
// 员工列表数据
const empList = ref([])

// watch 监听 searchEmp的date 变化
watch(() => searchEmp.value.date, (newVal, oldVal) => {
  if (newVal.length == 2) {
    searchEmp.value.beginDate = newVal[0]
    searchEmp.value.endDate = newVal[1]
  } else {
    searchEmp.value.beginDate = ''
    searchEmp.value.endDate = ''
  }
})

//新增员工
const addEmp = () => {
  dialogVisible.value = true
  dialogTitle.value = '新增员工'
  employee.value = {
    username: '',
    name: '',
    gender: '',
    phone: '',
    job: '',
    salary: '',
    deptId: '',
    entryDate: '',
    image: '',
    exprList: []
  }
  if(employeeFormRef.value) {
    employeeFormRef.value.resetFields()
  }
}


//新增/修改表单
const employeeFormRef = ref(null)
const employee = ref({
  username: '',
  name: '',
  gender: '',
  phone: '',
  job: '',
  salary: '',
  deptId: '',
  entryDate: '',
  image: '',
  exprList: []
})

// 控制弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('新增员工')

// 文件上传
// 图片上传成功后触发
const handleAvatarSuccess = (response, uploadFile) => {
  employee.value.image = response.data
}
// 文件上传之前触发
const beforeAvatarUpload = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('只支持上传图片')
    return false
  } else if (rawFile.size / 1024 / 1024 > 10) {
    ElMessage.error('只能上传10M以内图片')
    return false
  }
  return true
}

// 添加工作经历
const addExprItem = () => {
  employee.value.exprList.push({
    company:"",
    job:"",
    begin:"",
    end:"",
    exprDate:[]
  })
}

// 删除工作经历
const delExprItem = (index) => {
  employee.value.exprList.splice(index, 1)
}

// 侦听 employee 的 exprList 变化
watch(() => employee.value.exprList, (newVal, oldVal) => {
  if(employee.value.exprList && employee.value.exprList.length > 0) {
    employee.value.exprList.forEach(expr => {
      if(expr.exprDate && expr.exprDate.length == 2) {
        expr.begin = expr.exprDate[0]
        expr.end = expr.exprDate[1]
      } else {
        expr.begin = ''
        expr.end = ''
      }
    })
  }
}, {deep: true})

// 保存新增员工
const save = async () => {
  let res = null
  // 表单验证
  if (!employeeFormRef.value) {
    ElMessage.error("请先初始化表单引用")
    return
  }
  employeeFormRef.value.validate(async (valid) => {
    if (valid) {
      if(employee.value.id) {
        // 修改
        res = await updateApi(employee.value)
        if (res.code) {
          dialogVisible.value = false
          ElMessage.success(res.msg)
          search()
        } else {
          ElMessage.error(res.msg)
        }
      } else {
        // 新增
        res = await addApi(employee.value)
        if (res.code) {
          dialogVisible.value = false
          ElMessage.success(res.msg)
          search()
        } else {
          ElMessage.error(res.msg)
        }
      }
    } else {
        ElMessage.error("请检查表单信息")
      }
  })
}

// 表单校验规则
const rules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度应在2到20个字符之间', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度应在2到10个字符之间', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }
  ]
});

// 编辑员工
const edit = async (id) => {
  const res = await queryByIdApi(id)
  if (res.code) {
    employee.value = res.data
    dialogVisible.value = true
    dialogTitle.value = '编辑员工'
    // 对工作经历进行处理
    let exprList = employee.value.exprList
    if(exprList && exprList.length > 0) {
      exprList.forEach(expr => {
        expr.exprDate =(expr.exprDate && expr.exprDate.length == 2) ? [expr.begin, expr.end] : []
      })
    }
  } else {
    ElMessage.error(res.msg)
  }
}

// 删除员工
const deleteEmp = async (ids) => {
  ElMessageBox.confirm("确认删除选中员工吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    if(ids.length == 0) {
      ElMessage.error("请选择要删除的员工")
      return
    }
    const res = await deleteApi(ids)
    if (res.code) {
      ElMessage.success("删除成功")
      search()
    } else {
      ElMessage.error(res.msg)
    }
  }).catch(() => {
    ElMessage.info("已取消删除")
  })
}

// 选中行数据变化时触发 - selection: 选中的行数据(数组)
const handleSelectionChange = (selection) => {
  selectedRows.value = selection.map((item) => {
    return item.id
  })
}


</script>

<template>
  <h1>员工管理</h1>
  <!-- 搜索栏 -->
  <div class="container">
    <el-form :inline="true" :model="searchEmp" class="demo-form-inline">
      <el-form-item label="姓名">
        <el-input v-model="searchEmp.user" placeholder="请输入姓名" clearable />
      </el-form-item>
      <el-form-item label="性别">
        <el-select v-model="searchEmp.gender" placeholder="请选择" clearable>
          <el-option label="男" value="1" />
          <el-option label="女" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="入职时间">
        <el-date-picker v-model="searchEmp.date" type="daterange" range-separator="到" start-placeholder="开始时间"
          end-placeholder="结束时间" value-format="YYYY-MM-DD" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button type="info" @click="clear">清空</el-button>
      </el-form-item>
    </el-form>
  </div>
  <!-- 功能按钮 -->
  <div class="container">
    <el-button type="primary" @click="addEmp">新增员工</el-button>
    <el-button type="danger" @click="deleteEmp(selectedRows)">批量删除</el-button>
  </div>
  <!-- 表格 -->
  <div class="container">
    <el-table :data="empList" border style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="name" label="姓名" width="120" align="center" />
      <el-table-column label="性别" width="120" align="center">
        <template #default="scope">
          {{ scope.row.gender == 1 ? '男' : '女' }}
        </template>
      </el-table-column>
      <el-table-column label="头像" width="120" align="center">
        <template #default="scope">
          <img :src="scope.row.image" style="height: 40px" />
        </template>
      </el-table-column>
      <el-table-column prop="deptName" label="所属部门" width="120" align="center" />
      <el-table-column label="职位" width="120" align="center">
        <template #default="scope">
          <span v-if="scope.row.job == 1">班主任</span>
          <span v-else-if="scope.row.job == 2">讲师</span>
          <span v-else-if="scope.row.job == 3">学工主管</span>
          <span v-else-if="scope.row.job == 4">咨询师</span>
          <span v-else>其他</span>
        </template>
      </el-table-column>
      <el-table-column prop="entryDate" label="入职日期" width="180" align="center"/>
      <el-table-column prop="updateTime" label="最后操作时间" width="200" align="center"/>
      <el-table-column label="操作"align="center">
        <template #default="scope">
          <el-button type="primary" size="small" @click="edit(scope.row.id)"><el-icon>
              <EditPen />
            </el-icon>编辑</el-button>
          <el-button type="danger" size="small" @click="deleteEmp(scope.row.id)"><el-icon>
              <Delete />
            </el-icon>删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
  <!-- 分页条 -->
  <div class="container">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[5, 10, 20, 30, 40, 50, 100]"
      :background="background"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
  <!-- 新增/修改员工的对话框 -->
  <el-dialog v-model="dialogVisible" :title="dialogTitle" >
      <!-- ----------------------------------基本信息---------------------------------- -->
    <el-form ref="employeeFormRef" :model="employee" :rules="rules" label-width="80px">
      <!-- 第一行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="employee.username" placeholder="请输入员工用户名，2-20个字"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="employee.name" placeholder="请输入员工姓名，2-10个字"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第二行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="性别" prop="gender">
            <el-select v-model="employee.gender" placeholder="请选择性别" style="width: 100%;">
              <el-option v-for="item in genders" :key="item.value" :label="item.name" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="employee.phone" placeholder="请输入员工手机号"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第三行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="职位">
            <el-select v-model="employee.job" placeholder="请选择职位" style="width: 100%;">
              <el-option v-for="item in jobs" :key="item.value" :label="item.name" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="薪资">
            <el-input v-model="employee.salary" placeholder="请输入员工薪资"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第四行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="所属部门">
            <el-select v-model="employee.deptId" placeholder="请选择部门" style="width: 100%;">
              <el-option v-for="item in deptList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="入职日期">
            <el-date-picker v-model="employee.entryDate" type="date" style="width: 100%;" placeholder="选择日期"
              format="YYYY-MM-DD" value-format="YYYY-MM-DD"></el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第五行 -->
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="头像">
            <el-upload class="avatar-uploader" action="/api/upload" :show-file-list="false"
              :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload" :headers="{'token': token}">
              <img v-if="employee.image" :src="employee.image" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon">
                <Plus />
              </el-icon>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>


      <!-- ----------------------------------工作经历---------------------------------- -->
      <!-- 第六行 -->
      <el-row :gutter="10">
        <el-col :span="24">
          <el-form-item label="工作经历">
            <el-button type="success" size="small" @click="addExprItem">+ 添加工作经历</el-button>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第七行 ...  工作经历 -->
      <el-row :gutter="3" v-for="(expr, index) in employee.exprList">
        <el-col :span="10">
          <el-form-item size="small" label="时间" label-width="80px">
            <el-date-picker type="daterange" v-model="expr.exprDate" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
              format="YYYY-MM-DD" value-format="YYYY-MM-DD"></el-date-picker>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item size="small" label="公司" label-width="60px">
            <el-input placeholder="请输入公司名称" v-model="expr.company"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item size="small" label="职位" label-width="60px">
            <el-input placeholder="请输入职位" v-model="expr.job"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="2">
          <el-form-item size="small" label-width="0px">
            <el-button type="danger" @click="delExprItem(index)">- 删除</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- ----------------------------------底部按钮---------------------------------- -->
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </span>
    </template>

  </el-dialog>

</template>

<style scoped>
.container {
  margin: 10px 0px;
}
.avatar {
  height: 40px;
}
.avatar-uploader .avatar {
  width: 78px;
  height: 78px;
  display: block;
}
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 78px;
  height: 78px;
  text-align: center;
  /* 添加灰色的虚线边框 */
  border: 1px dashed var(--el-border-color);
}
</style>