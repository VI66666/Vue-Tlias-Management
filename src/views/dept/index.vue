<script setup>
import { ref, onMounted } from 'vue'
import { queryAllApi, addApi } from '@/api/dept'
import { ElMessage } from 'element-plus'

onMounted(() => {
  search()
})


// 查询
const search = async () => {
  const res = await queryAllApi()
  if (res.code) {
    deptList.value = res.data
  }
}

const deptList = ref([])

// dialog对话框
const dialogFormVisible = ref(false)
const formTitle = ref('')

const dept = ref({
  name: ''
})

 // 保存部门
const save = async () => {
  // 校验表单
  if (!deptFormRef.value) return
  deptFormRef.value.validate(async (valid) => {
    if (valid) {
      // 新增部门
      const res = await addApi(dept.value)
      if (res.code) {
        ElMessage.success('新增成功')
        dialogFormVisible.value = false
        search()
      } else {
        ElMessage.error(res.msg)
      }
    } else {
      ElMessage.error('请填写完整信息')
    }
  })
}

// 新增部门
const addDept = () => {
  formTitle.value = '新增部门'
  dept.value = {
    name: ''
  }
  dialogFormVisible.value = true
  // 重置表单
  if (deptFormRef.value) {
    deptFormRef.value.resetFields()
  }
}

// 表单验证规则
const rules = ref({
  name: [
    { required: true, message: '请输入部门名称', trigger: 'blur' }
    , { min: 2, max: 10, message: '部门名称长度必须在2到10个字符之间', trigger: 'blur' }
  ]
})

// 表单引用
const deptFormRef = ref()
</script>

<template>
  <h1>部门管理</h1>
  <!-- 按钮 -->
  <div class="container">
    <el-button type="primary" @click="addDept"> + 新增部门</el-button>
  </div>
  <!-- 表单 -->
  <div class="container">
    <el-table :data="deptList" border style="width: 100%">
      <el-table-column type="index" label="序号" width="100" align="center" />
      <el-table-column prop="name" label="部门名称" width="260" align="center" />
      <el-table-column prop="updateTime" label="最后操作时间" width="300" align="center" />
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button type="primary" size="small"><el-icon>
              <EditPen />
            </el-icon>编辑</el-button>
          <el-button type="danger" size="small"><el-icon>
              <Delete />
            </el-icon>删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
  <!-- Dialog对话框 -->
  <el-dialog v-model="dialogFormVisible" :title="formTitle" width="500">
    <el-form :model="dept" :rules="rules" ref="deptFormRef">
      <el-form-item label="部门名称" label-width="80px" prop="name">
        <el-input v-model="dept.name" placeholder="请输入部门名称" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="save">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.container {
  margin: 10px 0px;
}
</style>
