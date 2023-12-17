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

export const getTabConfigForPostId = (postId: string) => {
  return {
    chat: {
      tab: TabEnum.Chat,
      hidden: false,
      label: 'Chat',
      Icon: ChatBubbleLeftRightIcon,
      targetUrl: `/p/${postId}`,
    },
    // history: {
    //   tab: TabEnum.History,
    //   hidden: false,
    //   label: 'History',
    //   Icon: ClockIcon,
    //   targetUrl: `/p/${postId}/history`,
    // },
    configuration: {
      tab: TabEnum.Configuration,
      hidden: false,
      label: 'Configuration',
      Icon: Cog6ToothIcon,
      targetUrl: `/p/${postId}/configuration`,
    },
    // publishing: {
    //   tab: TabEnum.Publishing,
    //   hidden: true,
    //   label: 'Publishing',
    //   Icon: ShareIcon,
    //   targetUrl: `/p/${postId}/publishing`,
    // },
  }
}

export const getTabForRoute = (route: string): Tab | null => {
  switch (route) {
    case '/p/[post_id]/c/[chat_id]':
      return 'chat'

    case '/p/[post_id]/history':
      return 'history'

    case '/p/[post_id]/c/[chat_id]/configuration':
      return 'configuration'

    case '/p/[post_id]/publishing':
      return 'publishing'

    default:
      return null
  }
}
