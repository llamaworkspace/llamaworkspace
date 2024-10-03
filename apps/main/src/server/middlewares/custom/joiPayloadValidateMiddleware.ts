import withJoi from 'next-joi'

export const joiPayloadValidateMiddleware = withJoi({
  onValidationError: (_, res, validationError) => {
    res.status(422).send(validationError.details)
  },
})
