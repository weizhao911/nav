/*
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2024-06-06 10:14:37
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2025-11-13 18:20:24
 * @Description: 新增站点列表（修复排序字段丢失问题）
 */
import type { Response, WebsiteEdit, WebsiteList } from '~/lib/type'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { RESPONSE_STATUS_CODE } from '~/lib/enum'

export default defineEventHandler(async (event): Promise<Response<WebsiteList[]>> => {
  const client = await serverSupabaseClient<WebsiteList>(event)
  const user = await serverSupabaseUser(event)
  // 得到请求体
  const body: WebsiteEdit = await readBody(event)

  // 自动生成排序值（如果前端未传）
  let finalSort = body.sort
  if (typeof finalSort !== 'number') {
    const { data: maxSortData, error: sortError } = await client
      .from('ds_websites')
      .select('sort')
      .order('sort', { ascending: false })
      .limit(1)

    if (sortError) {
      throw createError({
        statusCode: RESPONSE_STATUS_CODE.FAIL,
        statusMessage: sortError.message
      })
    }

    finalSort = maxSortData?.[0]?.sort ? maxSortData[0].sort + 1 : 1
  }

  // 插入数据
  const { data, error } = await client
    .from('ds_websites')
    .insert({ ...body, sort: finalSort, email: user?.email })
    .select()

  // 判断请求结果
  if (error) {
    // 23505 是 PostgreSQL 的唯一性违反错误码
    if (error.code === '23505') {
      return {
        code: RESPONSE_STATUS_CODE.FAIL,
        msg: '站点名称已存在!'
      }
    } else {
      throw createError({
        statusCode: RESPONSE_STATUS_CODE.FAIL,
        statusMessage: error.message
      })
    }
  }

  // 请求成功
  return {
    code: RESPONSE_STATUS_CODE.SUCCESS,
    msg: '请求成功',
    data: data
  }
})
