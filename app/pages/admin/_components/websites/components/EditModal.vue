<template>
  <UModal
    v-model:open="isOpen"
    :title="state.id ? '编辑站点' : '新增站点'"
    :dismissible="false"
    :ui="{ footer: 'justify-end' }"
    aria-describedby="website-modal"
  >
    <template #body>
      <UForm ref="form" :schema :state class="space-y-4" @submit="onSubmit">
        <UFormField label="所属分类" name="category_id" required>
          <USelect
            v-model="state.category_id"
            placeholder="请选择所属分类"
            value-key="id"
            label-key="name"
            :items="categoryList || []"
            class="w-full"
          />
        </UFormField>

        <UFormField label="站点名称" name="name" required>
          <UInput
            v-model="state.name"
            placeholder="请输入站点名称"
            class="w-full"
            size="lg"
            :maxlength="12"
          >
            <template #trailing>
              <div id="character-count" class="text-xs text-muted tabular-nums">
                {{ state.name?.length || 0 }}/12
              </div>
            </template>
          </UInput>
        </UFormField>

        <UFormField label="网站链接" name="url" required>
          <UInput
            v-model="state.url"
            placeholder="请输入网站链接"
            class="w-full"
            size="lg"
            @blur="onUrlBlur"
          />
        </UFormField>

        <UFormField label="Logo" name="logo" required>
          <UInput v-model="state.logo" placeholder="请输入Logo" class="w-full" size="lg" />
        </UFormField>
        <UFormField name="sort" label="排序" required>
          <UInputNumber v-model="state.sort" placeholder="请输入排序" class="w-full" size="lg" :min="1" :max="9999" />
        </UFormField>
        <!-- 其他字段保持不变 -->
      </UForm>
    </template>

    <template #footer>
      <UButton color="neutral" variant="outline" label="取消" @click="closeModal" size="lg" />
      <UButton color="neutral" variant="solid" label="确认" :loading="loading" @click="form?.submit()" size="lg" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { WebsiteEdit, CategoryList } from "~/lib/type";
import { RESPONSE_STATUS_CODE } from "~/lib/enum";
import type { FormSubmitEvent } from "@nuxt/ui";

const props = defineProps<{
  modelValue: boolean;
  website?: WebsiteEdit | null;
  categoryList?: CategoryList[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const form = useTemplateRef("form");
const toast = useToast();

const schema = z.object({
  id: z.string().optional(),
  category_id: z.string("请选择所属分类"),
  name: z.string("请输入站点名称").min(1).max(12),
  url: z.string("请输入正确的站点链接"),
  logo: z.string("请输入Logo"),
  sort: z.number(),
});

type Schema = z.output<typeof schema>;

const getDefaultState = (): Partial<Schema> => ({
  id: undefined,
  category_id: undefined,
  name: undefined,
  url: undefined,
  logo: undefined,
  pinned: false,
  vpn: false,
  recommend: false,
  commonlyUsed: false,
  sort: 1,
});

const state = reactive<Partial<Schema>>(getDefaultState());
const loading = ref(false);

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

watch(
  () => props.website,
  (newWebsite) => {
    if (newWebsite) Object.assign(state, newWebsite);
    else Object.assign(state, getDefaultState());
  },
  { immediate: true, deep: true }
);

const closeModal = () => {
  isOpen.value = false;
  Object.assign(state, getDefaultState());
};

// 新增：根据 URL 自动获取站点信息
async function onUrlBlur() {
  if (state.url) {
    try {
      const { name, logo } = await $fetch(`/api/websites/meta?url=${encodeURIComponent(state.url)}`);
      if (name && !state.name) state.name = name;
      if (logo && !state.logo) state.logo = logo;
    } catch {
      toast.add({ title: "获取站点信息失败", color: "error" });
    }
  }
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true;
  try {
    const url = "/api/websites";
    const method = state.id ? "PUT" : "POST";
    await $fetch(url, { method, body: state }).then(({ code, msg }) => {
      if (code === RESPONSE_STATUS_CODE.SUCCESS) {
        toast.add({ title: state.id ? "编辑成功" : "新增成功", color: "success" });
        emit("success");
        closeModal();
      } else {
        toast.add({ title: msg, color: "error" });
      }
    });
  } finally {
    loading.value = false;
  }
}
</script>


