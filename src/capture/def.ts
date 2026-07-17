import { ZodType } from 'zod'
import { schema as relationshipSchema } from '../schema/relationships.js'
import { schema as planSchema } from '../schema/plans.js'

export const ApiType = {
    'relationship': {
        pageUrl: 'https://www.fanbox.cc/manage/relationships',
        hookUrl: 'https://api.fanbox.cc/relationship.listFans?status=supporter',
        schema: relationshipSchema,
    },
    'plan': {
        pageUrl: 'https://www.fanbox.cc/manage/plans',
        hookUrl: 'https://api.fanbox.cc/plan.listCreator?creatorId=',
        schema: planSchema,
    },
} satisfies {
    [key: string]: {
        pageUrl: string
        hookUrl: string
        schema: ZodType
    }
}
