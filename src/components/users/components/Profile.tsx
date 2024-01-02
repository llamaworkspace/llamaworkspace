import { SelectAiModelsFormField } from '@/components/ai/components/SelectAiModelsFormField'
import {
  Section,
  SectionBody,
  SectionWrapper,
  SectionWrapperTitle,
} from '@/components/ui/Section'
import { useSuccessToast } from '@/components/ui/toastHooks'
import { Field, Form as FinalForm } from 'react-final-form'
import { useSelf, useUpdateSelf } from '../usersHooks'

export function Profile() {
  const { mutate: updateSelf } = useUpdateSelf()
  const { data: user } = useSelf()
  const successToast = useSuccessToast()

  return (
    <SectionWrapper>
      <SectionWrapperTitle>Profile</SectionWrapperTitle>
      <Section>
        <SectionBody>
          <FinalForm
            onSubmit={(values) => {
              updateSelf(values, {
                onSuccess: () => {
                  successToast(undefined, 'Profile updated')
                },
              })
            }}
            initialValues={{ defaultModel: user?.defaultModel }}
            render={({ handleSubmit }) => {
              return (
                <div className="grid md:grid-cols-2">
                  <Field
                    name="defaultModel"
                    render={({ input }) => {
                      return (
                        <SelectAiModelsFormField
                          {...input}
                          placeholder="Select a model"
                          label="Default AI model"
                          helperText="AI model to be used by default when creating new chats."
                          onValueChange={() => void handleSubmit()}
                        />
                      )
                    }}
                  />
                </div>
              )
            }}
          />
        </SectionBody>
      </Section>
    </SectionWrapper>
  )
}
