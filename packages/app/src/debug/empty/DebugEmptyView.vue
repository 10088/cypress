<template>
  <div class="flex flex-col mx-auto my-45px max-w-640px items-center">
    <div class="flex flex-col items-center justify-evenly">
      <div><i-cy-box-open_x48 class="icon-dark-gray-500 icon-light-indigo-100" /></div>
      <div class="flex flex-col mx-[20%] mt-25px mb-20px items-center">
        <div class="font-medium my-5px text-center text-gray-900 text-18px">
          {{ title }}
        </div>
        <div class="font-normal my-5px text-center leading-relaxed text-16px text-gray-600">
          {{ description }} <ExternalLink
            v-if="helpLinkText && helpLinkHref"
            :href="helpLink"
          >
            {{ helpLinkText }}
          </ExternalLink>
        </div>
      </div>
      <slot name="cta" />
    </div>
    <div class="flex flex-col my-40px w-full items-center">
      <DebugTestLoadingContainer
        width-class="w-[75%]"
        dot-class="icon-light-gray-200"
        :rows="loadingRows"
      >
        <template #header>
          <div class="flex">
            <div class="bg-white border rounded-md flex border-gray-100 py-4px px-8px text-14px text-gray-700 gap-8px items-center">
              <i-cy-status-failed_x12 class="h-12px w-12px" />
              <span>-</span>
              <div
                v-if="exampleTestName"
                class="border-l border-gray-100 pl-8px"
              >
                {{ exampleTestName }}
              </div>
            </div>
          </div>
        </template>
      </DebugTestLoadingContainer>
    </div>
  </div>
</template>

<script lang="ts" setup>
import DebugTestLoadingContainer from './DebugTestLoadingContainer.vue'
import ExternalLink from '@cy/gql-components/ExternalLink.vue'
import { getUrlWithParams } from '@packages/frontend-shared/src/utils/getUrlWithParams'
import { getUtmSource } from '@packages/frontend-shared/src/utils/getUtmSource'

const props = defineProps<{
  title: string
  description?: string
  exampleTestName?: string
  helpLinkText?: string
  helpLinkHref?: string
}>()

const helpLink = getUrlWithParams({
  url: props.helpLinkHref || '',
  params: {
    utm_source: getUtmSource(),
    utm_medium: 'Debug Tab',
    utm_campaign: 'Learn More',
  },
})

const loadingRows = [
  ['w-40px', 'w-[40%]'],
  ['w-40px', 'w-[50%]'],
  ['w-40px', 'w-[65%]'],
]

</script>
