import { APIRequestContext } from 'playwright-core'
import { Login } from '../dto/login-dto'
import { baseUrl, loginEndpoint, ordersEndpoint } from '../tests/delivery/auth.spec'
import { StatusCodes } from 'http-status-codes'
import { CreateOrderResponseSchema, OrderDataSchema} from '../shema/OrderShema'
import {LoginRequestBodySchema, TokenSchema} from '../shema/LoginShema'

export async function fetchJwt(request: APIRequestContext, login: Login): Promise<string> {
  const authResponse = await request.post(baseUrl + loginEndpoint, {
    data : LoginRequestBodySchema.parse(login),
  })
  if (authResponse.status() !== StatusCodes.OK) {
    throw new Error(`Authorization failed. Status: ${authResponse.status()}`)
  }
  return TokenSchema.parse(await authResponse.text())
}

export async function createOrder(request: APIRequestContext, jwt: string): Promise<number> {
  const validatedJWT = TokenSchema.parse(jwt);
  const response = await request.post(baseUrl + ordersEndpoint, {
    data: OrderDataSchema.parse({
      status: 'OPEN',
      courierId: 0,
      customerName: 'vladimir',
      customerPhone: '55445566',
      comment: 'hello',
      id: 0,
    }),
    headers: {
      Authorization: `Bearer ${validatedJWT}`,
    },
  })
  console.log(await response.json())
  const validatedBody = CreateOrderResponseSchema.parse(await response.json())
  return validatedBody.id
}
