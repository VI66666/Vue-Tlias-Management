<script setup>
import { ref, onMounted, watch } from 'vue'
import { queryByPageApi } from '@/api/clazzz'
const formInline = ref({
  name: '',
  begin: '',
  end: '',
  date: []
})
const tableData = ref([])
// 分页参数
const total = ref(100)
const currentPage = ref(1)
const pageSize = ref(10)

// 查询班级列表
const searchClazz = async () => {
  // 调用查询班级列表的接口
  const res = await queryByPageApi(
    formInline.value.name,
    formInline.value.begin,
    formInline.value.end,
    currentPage.value,
    pageSize.value
  )
  if (res.code) {
    tableData.value = res.data.rows
    total.value = res.data.total
  }
}
// watch 监听 data 变化 将data 赋值给 begin 和 end
watch(() => formInline.value.date, (newVal) => {
  if (newVal.length > 0) {
    formInline.value.begin = newVal[0]
    formInline.value.end = newVal[1]
  }else{
    formInline.value.begin = ''
    formInline.value.end = ''
  }
})

// 清空表单
const clearForm = () => {
  formInline.value.name = ''
  formInline.value.begin = ''
  formInline.value.end = ''
  formInline.value.date = []
  searchClazz()
}

//// 钩子函数
onMounted(() => {
  searchClazz()
})
// 新增班级对话框
const dialogVisible = ref(false)
const dialogTital = ref('')

// 新增班级
const addClazz = () => {
  dialogVisible.value = true
  dialogTital.value = '新增班级'
}
</script>

<template>
  <h1>班级管理</h1>
  <!-- 搜索参数 -->
  <div class="container">
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="班级名称">
        <el-input v-model="formInline.name" placeholder="请输入班级名称" clearable />
      </el-form-item>
      <el-form-item label="结课时间">
        <el-date-picker v-model="formInline.date" type="daterange" range-separator="至" start-placeholder="开始时间"
          end-placeholder="结束时间" :size="size" value-format="YYYY-MM-DD"/>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="searchClazz">查询</el-button>
        <el-button type="info" @click="clearForm">清空</el-button>
      </el-form-item>
    </el-form>
  </div>
  <!-- 新增按钮 -->
   <div class="button">
    <el-button type="success" @click="addClazz"> + 新增班级</el-button>
  </div>
  <!-- 表格 -->
  <div class="container">
    <el-table :data="tableData" border style="width: 100%">
      <el-table-column type="index" label="序号" width="80" align="center" />
      <el-table-column prop="name" label="班级名称" width="180" align="center" />
      <el-table-column prop="room" label="班级教室" width="100" align="center" />
      <el-table-column prop="masterName" label="班主任" width="120" align="center" />
      <el-table-column prop="beginDate" label="开课时间" width="150" align="center" />
      <el-table-column prop="endDate" label="结课时间" width="150" align="center" />
      <el-table-column prop="status" label="状态" width="120" align="center" />
      <el-table-column prop="updateTime" label="最后修改时间" width="220" align="center" />
      <el-table-column label="操作" align="center">
        <template #default>
          <el-button type="primary" size="small">编辑</el-button>
          <el-button type="danger" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    </div>
  <!-- 分页 -->
  <div class="container">
      <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[5, 10, 20, 30, 40, 50, 100]"
      :size="size"
      :disabled="disabled"
      :background="background"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>

  <!-- 新增班级对话框 -->
   <el-dialog v-model="dialogVisible" title="dialogTital" width="800">
    <el-table :data="gridData">
      <el-table-column property="date" label="Date" width="150" />
      <el-table-column property="name" label="Name" width="200" />
      <el-table-column property="address" label="Address" />
    </el-table>
  </el-dialog>
  <el-dialog v-model="dialogFormVisible" title="Shipping address" width="500">
    <el-form :model="form">
      <el-form-item label="Promotion name" :label-width="formLabelWidth">
        <el-input v-model="form.name" autocomplete="off" />
      </el-form-item>
      <el-form-item label="Zones" :label-width="formLabelWidth">
        <el-select v-model="form.region" placeholder="Please select a zone">
          <el-option label="Zone No.1" value="shanghai" />
          <el-option label="Zone No.2" value="beijing" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="dialogFormVisible = false">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>

</template>

<style scoped>
.container {
  margin: 20px 0px 0px 0px;
}

.button {
  margin-top: 10px;
  margin-bottom: 20px;
}
</style>