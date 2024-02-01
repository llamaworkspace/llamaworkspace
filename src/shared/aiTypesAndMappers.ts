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
  GPT3_5_TURBO = 'openai/gpt-3.5-turbo',
  GPT4 = 'openai/gpt-4-turbo-preview',
}

export const OpenaiModelToHuman: Record<OpenAiModelEnum, string> = {
  [OpenAiModelEnum.GPT3_5_TURBO]: 'ChatGPT 3.5 Turbo',
  [OpenAiModelEnum.GPT4]: 'ChatGPT 4',
}
