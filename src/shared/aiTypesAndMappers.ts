export enum Author {
  User = 'user',
  Assistant = 'assistant',
  System = 'system',
}

export enum ChatAuthor {
  User = 'user',
  Assistant = 'assistant',
  System = 'system',
  Wizard = 'wizard',
}

export enum OpenAiModelEnum {
  GPT3_5_TURBO = 'gpt-3.5-turbo',
  GPT4 = 'gpt-4',
}

export const OpenaiModelToHuman: Record<OpenAiModelEnum, string> = {
  [OpenAiModelEnum.GPT3_5_TURBO]: 'ChatGPT 3.5 Turbo',
  [OpenAiModelEnum.GPT4]: 'ChatGPT 4',
}

export const OpenaiInternalModelToApiModel: Record<OpenAiModelEnum, string> = {
  [OpenAiModelEnum.GPT3_5_TURBO]: 'gpt-3.5-turbo',
  [OpenAiModelEnum.GPT4]: 'gpt-4-1106-preview',
}
