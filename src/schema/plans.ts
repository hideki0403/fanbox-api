import { z } from 'zod'

export const schema = z.looseObject({
  body: z.looseObject({
    plans: z.array(z.looseObject({
      id: z.string(),
      fee: z.number(),
    }))
  })
})
