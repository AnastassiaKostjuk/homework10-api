import { StatusCodes } from 'http-status-codes'
import { expect, test } from '@playwright/test'

test.describe('GET /product/{id}', () => {
  test('get product with correct id should receive code 200', async ({ request }) => {
    // Build and send a GET request to the server
    const response = await request.get('https://shop.tl-academy.ee/api/products/1')

    // parse raw response body to json
    const responseBody = await response.json()
    const statusCode = response.status()
    // Log the response status, body and headers
    console.log('response body:', responseBody)
    // Check if the response status is 200
    expect(statusCode).toBe(StatusCodes.OK)
  })

  test('get product with correct id should receive code 404', async ({ request }) => {
    const allProductResponse = await request.get('https://shop.tl-academy.ee/api/products')
    const allProductBody = await allProductResponse.json()
    const lastProductId: number = allProductBody.length

    const oneProductResponse = await request.get(
      'https://shop.tl-academy.ee/api/products/' + lastProductId + 1,
    ) // + 1 req
    const oneProductBody = await oneProductResponse.json()
    const oneProductStatusCode = oneProductResponse.status()

    console.log('response body:', oneProductBody)
    expect(oneProductStatusCode).toBe(StatusCodes.NOT_FOUND)
  })

  test('get product with incorrect id should receive code 400', async ({ request }) => {
    // Build and send a GET request to the server
    const response = await request.get('https://shop.tl-academy.ee/api/products/q1231wefqwef1232')

    const responseBody = await response.json()
    const statusCode = response.status()

    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('get product with negative id should receive code 400', async ({ request }) => {
    const response = await request.get('https://shop.tl-academy.ee/api/products/-1')

    const responseBody = await response.json()
    const statusCode = response.status()

    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('get product with incorrect id with number first should receive code 400', async ({
    request,
  }) => {
    const response = await request.get('https://shop.tl-academy.ee/api/products/1fewfwefwef')

    const responseBody = await response.json()
    const statusCode = response.status()

    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})

test('post product with correct data should receive code 201', async ({ request }) => {
  // prepare request body
  const requestBody = {
    name: 'Orange',
    category: 'Fruit',
    price: 2.39,
    quantity: 10,
  }
  // Send a POST request to the server
  const response = await request.post('https://shop.tl-academy.ee/api/products', {
    data: requestBody,
  })
  // parse raw response body to json
  const responseBody = await response.json()
  const statusCode = response.status()

  // Log the response status and body
  console.log('response status:', statusCode)
  console.log('response body:', responseBody)

  expect(statusCode).toBe(StatusCodes.CREATED)
  // check that body.name is string type
  expect(typeof responseBody.name).toBe('string')
  // check that body.price is number type
  expect(typeof responseBody.price).toBe('number')
})

//homework10-negative-tests
test.describe('POST /api/products negative tests', () => {
  test('POST product without name should receive code 400', async ({ request }) => {
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: {
        category: 'Vegetables',
        price: 1.45,
        quantity: 10,
      },
    })

    const responseBody = await response.json()
    console.log('response body:', responseBody)
    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
    expect(responseBody.error).toBe('Name is required')
  })

  test('POST product without name and category should receive code 400', async ({ request }) => {
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: {
        price: 1.45,
        quantity: 10,
      },
    })

    const responseBody = await response.json()
    console.log('response body:', responseBody)
    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
    expect(responseBody.error).toBe('Name is required')
  })

  test('POST product with quantity below 0 should receive code 400', async ({ request }) => {
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: {
        name: 'Apple',
        category: 'Fruit',
        price: 1.45,
        quantity: -10,
      },
    })

    const responseBody = await response.json()
    console.log('response body:', responseBody)
    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
    expect(responseBody.error).toBe('Quantity must be a non-negative integer')
  })

  test('POST product with price as a string should receive code 400', async ({ request }) => {
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: {
        name: 'Apple',
        category: 'Fruit',
        price: '1.45',
        quantity: 10,
      },
    })

    const responseBody = await response.json()
    console.log('response body:', responseBody)
    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
    expect(responseBody.error).toBe('Price must be a number')
  })
})
