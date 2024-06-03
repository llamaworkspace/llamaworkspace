import {
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/solid'

export type Tab = 'chat' | 'history' | 'configuration' | 'publishing'

export enum TabEnum {
  Chat = 'chat',
  History = 'history',
  Configuration = 'configuration',
}

export const getTabConfigForAppId = (appId: string) => {
  return {
    chat: {
      tab: TabEnum.Chat,
      hidden: false,
      label: 'Chat',
      Icon: ChatBubbleLeftRightIcon,
      targetUrl: `/p/${appId}`,
    },
    // history: {
    //   tab: TabEnum.History,
    //   hidden: false,
    //   label: 'History',
    //   Icon: ClockIcon,
    //   targetUrl: `/p/${appId}/history`,
    // },
    configuration: {
      tab: TabEnum.Configuration,
      hidden: false,
      label: 'Configuration',
      Icon: Cog6ToothIcon,
      targetUrl: `/p/${appId}/configuration`,
    },
    // publishing: {
    //   tab: TabEnum.Publishing,
    //   hidden: true,
    //   label: 'Publishing',
    //   Icon: ShareIcon,
    //   targetUrl: `/p/${appId}/publishing`,
    // },
  }
}

export const getTabForRoute = (route: string): Tab | null => {
  switch (route) {
    case '/p/[app_id]/c/[chat_id]':
      return 'chat'

    case '/p/[app_id]/history':
      return 'history'

    case '/p/[app_id]/c/[chat_id]/configuration':
      return 'configuration'

    case '/p/[app_id]/publishing':
      return 'publishing'

    default:
      return null
  }
}
