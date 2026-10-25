import { StatusCodes } from 'http-status-codes'
import { expect, test } from '@playwright/test'
import { AccountDTO } from '../../dto/AccountDTO'
import { DepositDTO } from '../../dto/DepositDTO'
import { TransferDTO } from '../../dto/TransferDTO'
import { AccountWithoutOwnerDTO } from '../../dto/AccountWithoutOwnerDTO'

const baseUrl = 'https://shop.tl-academy.ee'
const authHeader = {
  'X-API-KEY': 'my-api-key',
}

// interface CreatedAccountResp {
//   id: number,
//   owner: string,
//   currency: string,
//   balance: number,
//   createdAt: string
// }ßß

type CreatedAccountResp = {
  id: number
  owner: string
  currency: string
  balance: number
  createdAt: string
}

type CreatedAccountErrorResp = {
  error: string
}

test.describe('/api/accounts critical path', () => {
  test('TL-11-1 POST /api/accounts with valid data without currency', async ({ request }) => {
    const account = new AccountDTO('Test Owner')
    const response = await request.post(baseUrl + '/api/accounts', {
      headers: authHeader,
      data: account,
    })
    const respBody: CreatedAccountResp = await response.json()
    console.log(respBody)
    expect(response.status()).not.toBe(StatusCodes.FORBIDDEN)
    expect(response.status()).toBe(StatusCodes.CREATED)
    expect(respBody.owner).toBe(account.owner)
  })

  const currencies = ['USD', 'EUR', 'GBP']

  test(`TL-11-3 POST /api/accounts with valid data and all supported currencies: ${currencies}`, async ({
    request,
  }) => {
    for (const currency of currencies) {
      const account = new AccountDTO('Test Owner', currency)
      const response = await request.post(baseUrl + '/api/accounts', {
        headers: authHeader,
        data: account,
      })
      const respBody: CreatedAccountResp = await response.json()
      console.log(respBody)
      expect.soft(response.status(), `Tested ${currency} currency`).not.toBe(StatusCodes.FORBIDDEN)
      expect.soft(response.status(), `Tested ${currency} currency`).toBe(StatusCodes.CREATED)
      expect.soft(respBody.owner, `Tested ${currency} currency`).toBe(account.owner)
      expect.soft(respBody.currency, `Tested ${currency} currency`).toBe(account.currency)
    }
  })
})

test.describe('/api/accounts negative tests', () => {
  test('TL-11-2 POST /api/accounts with invalid data', async ({ request }) => {
    const account = new AccountDTO('Test Owner', 'PLN')
    const response = await request.post(baseUrl + '/api/accounts', {
      headers: authHeader,
      data: account,
    })

    const respBody: CreatedAccountErrorResp = await response.json()
    console.log(respBody)
    expect.soft(response.status()).not.toBe(StatusCodes.FORBIDDEN)
    expect.soft(response.status()).toBe(StatusCodes.BAD_REQUEST)
    expect.soft(respBody.error).not.toBeUndefined()
    expect.soft(respBody.error.length).toBeGreaterThan(0)
  })
})

//homework 11 - api
test.describe('Check list /api/accounts', () => {
  test('GET /api/accounts', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/accounts`, { headers: authHeader })
    console.log('Status:', response.status())
    console.log('Response:', await response.json())
    expect(response.status()).toBe(StatusCodes.OK)
  })

  test('GET /api/accounts negative test without api key', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/accounts`)
    console.log('Status:', response.status())
    console.log('Response:', await response.json())
    expect(response.status()).toBe(StatusCodes.UNAUTHORIZED)
  })

  test('GET /api/accounts/{id}', async ({ request }) => {
    const newAccount = await request.post(`${baseUrl}/api/accounts/`, {
      headers: authHeader,
      data: new AccountDTO('Harry Potter')
    })

    const account = await newAccount.json()

    const response = await request.get(`${baseUrl}/api/accounts/${account.id}`, {
      headers: authHeader,
    })
    console.log('Status:', response.status())
    console.log('Response:', await response.json())
    expect(response.status()).toBe(StatusCodes.OK)
  })

  test('GET /api/accounts/{id} negative test with invalid id', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/accounts/-1`, { headers: authHeader })
    console.log('Status:', response.status())
    console.log('Response:', await response.json())
    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  test('GET /api/accounts/{id} negative test with string id', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/accounts/dfghgf`, { headers: authHeader })
    console.log('Status:', response.status())
    console.log('Response:', await response.json())
    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  test('POST /api/accounts with owner only', async ({ request }) => {
    const response = await request.post(baseUrl + '/api/accounts', {
      headers: authHeader,
      data: new AccountDTO('Hermione Granger')
    })

    console.log('Status:', response.status())
    console.log('Response:', await response.json())
    expect(response.status()).toBe(StatusCodes.CREATED)
  })

  test('POST /api/accounts with owner and currency', async ({ request }) => {
    const response = await request.post(baseUrl + '/api/accounts', {
      headers: authHeader,
      data: new AccountDTO('Eileen Prince', 'USD'),
    })

    console.log('Status:', response.status())
    console.log('Response:', await response.json())
    expect(response.status()).toBe(StatusCodes.CREATED)
  })

  test('POST /api/accounts without owner', async ({ request }) => {
    const response = await request.post(baseUrl + '/api/accounts', {
      headers: authHeader,
      data: new AccountWithoutOwnerDTO('GBP')
    })

    console.log('Status:', response.status())
    console.log('Response:', await response.json())
    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  test('POST /api/accounts with unsupported currency', async ({ request }) => {
    const response = await request.post(baseUrl + '/api/accounts', {
      headers: authHeader,
      data: new AccountDTO('Narcissa Malfoy', 'ALL'),
    })

    console.log('Status:', response.status())
    console.log('Response:', await response.json())
    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  test('POST /api/accounts/{id}/deposit', async ({ request }) => {
    const newAccount = await request.post(`${baseUrl}/api/accounts/`, {
      headers: authHeader,
      data: new AccountDTO('Ron Weasley')
    })

    const account = await newAccount.json()

    const response = await request.post(baseUrl + `/api/accounts/${account.id}/deposit`, {
      headers: authHeader,
      data: new DepositDTO(1000000)
    })

    console.log('Status:', response.status())
    console.log('Response:', await response.json())
    expect(response.status()).toBe(StatusCodes.OK)
  })

  test('POST /api/accounts/{id}/deposit negative test with number below zero', async ({
    request,
  }) => {
    const newAccount = await request.post(`${baseUrl}/api/accounts/`, {
      headers: authHeader,
      data: new AccountDTO('Albus Dumbledore')
    })

    const account = await newAccount.json()

    const response = await request.post(baseUrl + `/api/accounts/${account.id}/deposit`, {
      headers: authHeader,
      data: new DepositDTO(-1000000)
    })

    console.log('Status:', response.status())
    console.log('Response:', await response.json())
    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  test('POST /api/accounts/{id}/deposit negative test with number written as a string', async ({
    request,
  }) => {
    const newAccount = await request.post(`${baseUrl}/api/accounts/`, {
      headers: authHeader,
      data: new AccountDTO('Tom Riddle')
    })

    const account = await newAccount.json()

    const response = await request.post(baseUrl + `/api/accounts/${account.id}/deposit`, {
      headers: authHeader,
      data: new DepositDTO('1000000')
    })

    console.log('Status:', response.status())
    console.log('Response:', await response.json())
    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  test('POST /api/accounts/{id}/deposit negative test with float number with more than two numbers after comma', async ({
    request,
  }) => {
    const newAccount = await request.post(`${baseUrl}/api/accounts/`, {
      headers: authHeader,
      data: new AccountDTO('Rubeus Hagrid')
    })

    const account = await newAccount.json()

    const response = await request.post(baseUrl + `/api/accounts/${account.id}/deposit`, {
      headers: authHeader,
      data: new DepositDTO(100.255555555)
    })

    console.log('Status:', response.status())
    console.log('Response:', await response.json())
    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  test('POST /api/accounts/{id}/deposit negative test with invalid id', async ({ request }) => {
    const response = await request.post(baseUrl + '/api/accounts/-1/deposit', {
      headers: authHeader,
      data: new DepositDTO(1000000)
    })

    console.log('Status:', response.status())
    console.log('Response:', await response.json())
    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  test('POST /api/accounts/{id}/transfer', async ({ request }) => {
    const senderAccount = await request.post(`${baseUrl}/api/accounts/`, {
      headers: authHeader,
      data: new AccountDTO('Nymphadora Tonks')
    })

    const account = await senderAccount.json()

    await request.post(baseUrl + `/api/accounts/${account.id}/deposit`, {
      headers: authHeader,
      data: new DepositDTO(500)
    })

    const receiverAccount = await request.post(`${baseUrl}/api/accounts/`, {
      headers: authHeader,
      data: new AccountDTO('Luna Lovegood')
    })

    const account2 = await receiverAccount.json()

    const response = await request.post(baseUrl + `/api/accounts/${account.id}/transfer`, {
      headers: authHeader,
      data: new TransferDTO(account2.id, 100)
    })

    console.log('Status:', response.status())
    console.log('Response:', await response.json())
    expect(response.status()).toBe(StatusCodes.OK)
  })

  test('POST /api/accounts/{id}/transfer with not enough money', async ({ request }) => {
    const senderAccount = await request.post(`${baseUrl}/api/accounts/`, {
      headers: authHeader,
      data: new AccountDTO('Severus Snape')
    })

    const account = await senderAccount.json()

    await request.post(baseUrl + `/api/accounts/${account.id}/deposit`, {
      headers: authHeader,
      data: new DepositDTO(10)
    })

    const receiverAccount = await request.post(`${baseUrl}/api/accounts/`, {
      headers: authHeader,
      data: new AccountDTO('Lord Voldemort')
    })

    const account2 = await receiverAccount.json()

    const response = await request.post(baseUrl + `/api/accounts/${account.id}/transfer`, {
      headers: authHeader,
      data: new TransferDTO(account2.id, 75)
    })

    console.log('Status:', response.status())
    console.log('Response:', await response.json())
    expect(response.status()).toBe(StatusCodes.CONFLICT)
  })

  //расхождение между документацией и поведением сервера
  test.fail('POST /api/accounts/{id}/transfer to the same account', async ({ request }) => {
    const senderAccount = await request.post(`${baseUrl}/api/accounts/`, {
      headers: authHeader,
      data: new AccountDTO('Gilderoy Lockhart')
    })

    const account = await senderAccount.json()

    await request.post(baseUrl + `/api/accounts/${account.id}/deposit`, {
      headers: authHeader,
      data: new DepositDTO(15)
    })

    const response = await request.post(baseUrl + `/api/accounts/${account.id}/transfer`, {
      headers: authHeader,
      data: new TransferDTO(account.id, 15)
    })

    console.log('Status:', response.status())
    console.log('Response:', await response.json())
    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  //расхождение между документацией и поведением сервера
  test.fail('POST /api/accounts/{id}/transfer to account without the same currency', async ({ request }) => {
      const senderAccount = await request.post(`${baseUrl}/api/accounts/`, {
        headers: authHeader,
        data: new AccountDTO('Seamus Finnigan', 'USD')
      })

      const account = await senderAccount.json()

      await request.post(baseUrl + `/api/accounts/${account.id}/deposit`, {
        headers: authHeader,
        data: new DepositDTO(700)
      })

      const receiverAccount = await request.post(`${baseUrl}/api/accounts/`, {
        headers: authHeader,
        data: new AccountDTO('Pomona Sprout', 'EUR')
      })

      const account2 = await receiverAccount.json()

      const response = await request.post(baseUrl + `/api/accounts/${account.id}/transfer`, {
        headers: authHeader,
        data: new TransferDTO(account2.id, 33)
      })

      console.log('Status:', response.status())
      console.log('Response:', await response.json())
      expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
    },
  )

  test('POST /api/accounts/{id}/transfer with amount that is zero', async ({ request }) => {
    const senderAccount = await request.post(`${baseUrl}/api/accounts/`, {
      headers: authHeader,
      data: new AccountDTO('Fred Weasley')
    })

    const account = await senderAccount.json()

    await request.post(baseUrl + `/api/accounts/${account.id}/deposit`, {
      headers: authHeader,
      data: new DepositDTO(25)
    })

    const receiverAccount = await request.post(`${baseUrl}/api/accounts/`, {
      headers: authHeader,
      data: new AccountDTO('George Weasley')
    })

    const account2 = await receiverAccount.json()

    const response = await request.post(baseUrl + `/api/accounts/${account.id}/transfer`, {
      headers: authHeader,
      data: new TransferDTO(account2.id, 0)
    })

    console.log('Status:', response.status())
    console.log('Response:', await response.json())
    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  test('POST /api/accounts/{id}/transfer to an nonexistent account', async ({ request }) => {
    const senderAccount = await request.post(`${baseUrl}/api/accounts/`, {
      headers: authHeader,
      data: new AccountDTO('Molly Weasley')
    })

    const account = await senderAccount.json()

    await request.post(baseUrl + `/api/accounts/${account.id}/deposit`, {
      headers: authHeader,
      data: new DepositDTO(560)
    })

    const nonexistentId = 999999999999999
    const receiverAccount = await request.get(`${baseUrl}/api/accounts/${nonexistentId}`,
      { headers:
        authHeader },
    )

    expect(receiverAccount.status()).toBe(StatusCodes.NOT_FOUND)

    const response = await request.post(baseUrl + `/api/accounts/${account.id}/transfer`, {
      headers: authHeader,
      data: new TransferDTO(nonexistentId, 15)
    })

    console.log('Status:', response.status())
    console.log('Response:', await response.json())
    expect(response.status()).toBe(StatusCodes.NOT_FOUND)
  })

  test('POST /api/accounts/{id}/transfer with non positive amount', async ({ request }) => {
    const senderAccount = await request.post(`${baseUrl}/api/accounts/`, {
      headers: authHeader,
      data: new AccountDTO('Bellatrix LeStrange')
    })

    const account = await senderAccount.json()

    await request.post(baseUrl + `/api/accounts/${account.id}/deposit`, {
      headers: authHeader,
      data: new DepositDTO(789)
    })

    const receiverAccount = await request.post(`${baseUrl}/api/accounts/`, {
      headers: authHeader,
      data: new AccountDTO('Andromeda Tonks')
    })

    const account2 = await receiverAccount.json()

    const response = await request.post(baseUrl + `/api/accounts/${account.id}/transfer`, {
      headers: authHeader,
      data: new TransferDTO(account2.id, -15)
    })

    console.log('Status:', response.status())
    console.log('Response:', await response.json())
    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })
})
