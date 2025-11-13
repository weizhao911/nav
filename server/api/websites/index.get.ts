/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2024-05-29 14:39:50
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2025-11-13 17:54:40
 * @Description: 获取站点列表（修复搜索/分页/空字符串过滤问题）
 */
import type { Response, PageResponse, WebsiteList, WebsiteParams } from '~/lib/type'
import { serverSupabaseClient } from '#supabase/server'
import { RESPONSE_STATUS_CODE } from '~/lib/enum'

export default defineEventHandler(async (event): Promise<Response<PageResponse<WebsiteList>>> => {
  const client = await serverSupabaseClient(event)
  // 获取请求参数
  const { current, pageSize, name, category_id } = getQuery(event) as WebsiteParams

  // 参数容错处理
  const currentNum = Number(current) || 1
  const pageSizeNum = Number(pageSize) || 10
  const nameStr = (name && name.trim() !== '') ? name.trim() : null
  const categoryIdStr = (category_id && category_id.trim() !== '') ? category_id.trim() : null

  // 计算分页
  const start = (currentNum - 1) * pageSizeNum
  const end = currentNum * pageSizeNum - 1

  // 查询 sql
  let sqlQuery = client
    .from('ds_websites')
    .select('*,ds_categorys(*)', { count: 'exact' })
    .range(start, end)
    .order('pinned', { ascending: false })
    .order('sort', { ascending: false })
    .order('recommend', { ascending: false })
    .order('created_at', { ascending: false })

  // 判断查询参数（避免空字符串过滤掉所有数据）
  if (nameStr) {
    sqlQuery = sqlQuery.like('name', `%${nameStr}%`)
  }
  if (categoryIdStr) {
    sqlQuery = sqlQuery.eq('category_id', categoryIdStr)
  }

  // 请求列表
  const { data, error, count } = await sqlQuery

  // 判断请求结果
  if (error) {
    throw createError({
      statusCode: RESPONSE_STATUS_CODE.FAIL,
      statusMessage: error.message
    })
  }

  // 请求成功
  return {
    code: RESPONSE_STATUS_CODE.SUCCESS,
    msg: '请求成功',
    data: {
      list: data || [],
      total: count || 0
    }
  }
})
