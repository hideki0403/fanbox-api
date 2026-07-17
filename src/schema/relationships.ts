import { z } from 'zod'

export const schema = z.looseObject({
  body: z.array(
    z.looseObject({
      status: z.string(),
      user: z.looseObject({
        userId: z.string()
      }),
      planId: z.string()
    })
  )
})
