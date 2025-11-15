<!--
 * @Author: 白雾茫茫丶<baiwumm.com>
 * @Date: 2024-04-10 16:25:21
 * @LastEditors: 白雾茫茫丶<baiwumm.com>
 * @LastEditTime: 2025-07-23 08:50:12
 * @Description: 顶部布局
-->
<template>
  <header
    class="flex gap-4 justify-between items-center sticky top-0 h-14 shadow-md dark:shadow-white-500/50 backdrop-blur transition-all w-full dark:shadow-[0_4px_6px_-1px_rgb(255,255,255,0.1)] z-50 px-6"
  >
    <!-- logo -->
    <NuxtLink to="/">
      <div class="flex gap-4 items-center">
        <!-- logo -->
        <NuxtImg src="/logo.svg" alt="logo" class="w-8 h-8" />
        <SplitText
          :text="$config.public.siteTitle"
          class-name="text-xl !hidden font-semibold md:!block"
          :delay="100"
          :duration="0.6"
          ease="power3.out"
          split-type="chars"
          :from="{ opacity: 0, y: 40 }"
          :to="{ opacity: 1, y: 0 }"
          :threshold="0.1"
          root-margin="-100px"
          text-align="center"
        />
      </div>
    </NuxtLink>
    
    <!-- 搜索栏 -->
    <div class="flex-1 max-w-xl mx-4 hidden md:flex">
      <div class="relative w-full">
        <select v-model="selectedEngine" class="absolute left-2 top-1/2 -translate-y-1/2 bg-transparent border-none text-sm focus:outline-none">
          <option value="google">Google</option>
          <option value="baidu">百度</option>
          <option value="bing">Bing</option>
          <option value="metaso">秘塔搜索</option>
        </select>
        <input 
          v-model="searchQuery" 
          @keyup.enter="handleSearch" 
          type="text" 
          placeholder="搜索..." 
          class="w-full pl-24 pr-10 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button @click="handleSearch" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <UIcon name="ri:search-line" class="!size-5" />
        </button>
      </div>
    </div>
    
    <!-- 右侧 社交图标 -->
    <div class="flex items-center">
      <!-- 夜间模式 -->
      <ColorMode />
      <!-- github -->
      <SocialIcon url="https://github.com/baiwumm/dream-site" tip="Github" icon="i-simple-icons-github" />
      <!-- 登录用户头像 -->
      <user-avatar />
      <!-- 跳转管理界面 -->
      <JumpAdmin />
      <!-- 注销用户按钮 -->
      <Logout />
    </div>
  </header>
</template>
<script setup lang="ts">
const colorMode = useColorMode();

// 判断是否暗色模式
const isDark = colorMode.preference === "dark";

// 搜索相关
const searchQuery = ref('');
const selectedEngine = ref('google');

// 搜索引擎配置
const searchEngines = {
  google: 'https://www.google.com/search?q=',
  baidu: 'https://www.baidu.com/s?wd=',
  bing: 'https://www.bing.com/search?q=',
  metaso: 'https://metaso.cn/search?q='
};

// 处理搜索
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    const searchUrl = searchEngines[selectedEngine.value] + encodeURIComponent(searchQuery.value.trim());
    window.open(searchUrl, '_blank');
    searchQuery.value = '';
  }
};
</script>
