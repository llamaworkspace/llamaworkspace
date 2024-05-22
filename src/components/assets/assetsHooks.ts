import { api } from '@/lib/api'
import { useErrorHandler } from '../global/errorHandlingHooks'

export const useCreateFileUploadPresignedUrl = () => {
  const errorHandler = useErrorHandler()

  return api.assets.createFileUploadPresignedUrl.useMutation({
    onError: errorHandler(),
  })
}

// export const useNotifyFileUploadSuccess = () => {
//   const errorHandler = useErrorHandler()

//   return api.posts.notifyFileUploadSuccess.useMutation({
//     onError: errorHandler(),
//   })
// }

// export const useAppFiles = (appId?: string) => {
//   const errorHandler = useErrorHandler()

//   return api.posts.getAppFiles.useQuery(
//     { appId: appId! },
//     {
//       onError: errorHandler(),
//       enabled: !!appId,
//     },
//   )
// }

// export const useDeleteAppFiles = () => {
//   const errorHandler = useErrorHandler()

//   return api.posts.deleteAppFiles.useMutation({
//     onError: errorHandler(),
//   })
// }
