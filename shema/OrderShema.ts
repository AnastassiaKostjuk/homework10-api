import { z } from 'zod'

export const OrderDataSchema = z
  .object({
    status: z.string(),
    courierId: z.number(),
    customerName: z.string(),
    customerPhone: z.string(),
    comment: z.string().nullable(),
    id: z.number(),
  })
  .strict()

export const CreateOrderResponseSchema = z //схема ответа при создании заказа
  .object({
    status: z.string(),
    courierId: z.number().nullable(),
    customerName: z.string(),
    customerPhone: z.string(),
    comment: z.string().nullable(),
    id: z.number(),
  })
  .strict()

export const GetOrdersResponseSchema = z //схема списка заказов
  .array(
    z.object({
      status: z.string(),
      courierId: z.number().nullable(),
      customerName: z.string(),
      customerPhone: z.string(),
      comment: z.string().nullable(),
      id: z.number(),
    }).strict(),
  )