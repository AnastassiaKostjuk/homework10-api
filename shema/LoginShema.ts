import { z } from "zod";

export const LoginRequestBodySchema = z.object({
  username: z.string(),
  password: z.string()
}).strict();

export const TokenSchema = z.jwt() //схема для проверки значения токена
//DL_USERNAME=user-qa-auto