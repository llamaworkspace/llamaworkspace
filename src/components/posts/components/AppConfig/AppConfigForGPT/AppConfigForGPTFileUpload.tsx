import {
  useCreateFileUploadPresignedUrl,
  useNotifyFileUploadSuccess,
} from '@/components/posts/postsHooks'
import { Input } from '@/components/ui/input'
import { useState, type ChangeEvent } from 'react'

const SUPPORTED_FILE_TYPES =
  '.c,.cs,.cpp,.doc,.docx,.html,.java,.json,.md,.pdf,.php,.pptx,.py,.py,.rb,.tex,.txt,.css,.js,.sh,.ts'

export const AppConfigForGPTFileUpload = ({ postId }: { postId?: string }) => {
  const [file, setFile] = useState<File | null>(null)
  const { mutateAsync: createFileUploadPresignedUrl } =
    useCreateFileUploadPresignedUrl()
  const { mutateAsync: notifyFileUploadSuccess } = useNotifyFileUploadSuccess()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.files)
    const first = event.target.files?.[0]!
    setFile(first)
  }

  const handleUpload = async () => {
    if (!postId) return
    if (!file) return
    const { presignedUrl, appFile } = await createFileUploadPresignedUrl({
      postId,
      fileName: file.name,
    })

    console.log(presignedUrl)
    const formData = new FormData()
    Object.keys(presignedUrl.fields).forEach((key) => {
      formData.append(key, presignedUrl.fields[key]!)
    })
    formData.append('file', file)

    const response = await fetch(presignedUrl.url, {
      method: 'POST',
      body: formData,
    })

    if (response.ok) {
      await notifyFileUploadSuccess({ appFileId: appFile.id })
      console.log('File uploaded successfully')
    } else {
      console.error('Error uploading file', response.statusText)
    }
  }

  return (
    <div>
      <button onClick={() => void handleUpload()}>Upload</button>
      <Input
        onChange={handleChange}
        type="file"
        accept={SUPPORTED_FILE_TYPES}
      />
    </div>
  )
}
