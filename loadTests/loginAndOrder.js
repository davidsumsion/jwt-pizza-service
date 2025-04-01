// /* eslint-disable */
// import { sleep, check, fail } from 'k6'
// import http from 'k6/http'
// import jsonpath from 'https://jslib.k6.io/jsonpath/1.0.2/index.js'

// export const options = {
//   cloud: {
//     distribution: { 'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 100 } },
//     apm: [],
//   },
//   thresholds: {},
//   scenarios: {
//     Scenario_1: {
//       executor: 'ramping-vus',
//       gracefulStop: '30s',
//       stages: [
//         { target: 20, duration: '1m' },
//         { target: 30, duration: '1m' },
//         { target: 0, duration: '30s' },
//       ],
//       gracefulRampDown: '30s',
//       exec: 'scenario_1',
//     },
//   },
// }

// export function scenario_1() {
//   let response

//   const vars = {}

//   response = http.put(
//     'https://pizza-service.pizza324.click/api/auth',
//     '{"email":"a@jwt.com","password":"admin"}',
//     {
//       headers: {
//         accept: '*/*',
//         'accept-encoding': 'gzip, deflate, br, zstd',
//         'accept-language': 'en-US,en;q=0.9',
//         'content-type': 'application/json',
//         origin: 'https://pizza.pizza324.click',
//         priority: 'u=1, i',
//         'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
//         'sec-ch-ua-mobile': '?0',
//         'sec-ch-ua-platform': '"macOS"',
//         'sec-fetch-dest': 'empty',
//         'sec-fetch-mode': 'cors',
//         'sec-fetch-site': 'same-site',
//       },
//     }
//   )

//   if (!check(response, { 'status equals 200': response => response.status.toString() === '200' })) {
//     console.log(response.body);
//     fail('Login was *not* 200');
//   }

//   vars['token'] = jsonpath.query(response.json(), '$.token')[0]

//   sleep(6)

//   response = http.get('https://pizza-service.pizza324.click/api/order/menu', {
//     headers: {
//       accept: '*/*',
//       'accept-encoding': 'gzip, deflate, br, zstd',
//       'accept-language': 'en-US,en;q=0.9',
//       authorization: `Bearer ${vars['token']}`,
//       'content-type': 'application/json',
//       'if-none-match': 'W/"1fc-cgG/aqJmHhElGCplQPSmgl2Gwk0"',
//       origin: 'https://pizza.pizza324.click',
//       priority: 'u=1, i',
//       'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
//       'sec-ch-ua-mobile': '?0',
//       'sec-ch-ua-platform': '"macOS"',
//       'sec-fetch-dest': 'empty',
//       'sec-fetch-mode': 'cors',
//       'sec-fetch-site': 'same-site',
//     },
//   })
//   sleep(0.5)

//   response = http.get('https://pizza-service.pizza324.click/api/franchise', {
//     headers: {
//       accept: '*/*',
//       'accept-encoding': 'gzip, deflate, br, zstd',
//       'accept-language': 'en-US,en;q=0.9',
//       authorization: `Bearer ${vars['token']}`,
//       'content-type': 'application/json',
//       'if-none-match': 'W/"40-EPPawbPn0KtYVCL5qBynMCqA1xo"',
//       origin: 'https://pizza.pizza324.click',
//       priority: 'u=1, i',
//       'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
//       'sec-ch-ua-mobile': '?0',
//       'sec-ch-ua-platform': '"macOS"',
//       'sec-fetch-dest': 'empty',
//       'sec-fetch-mode': 'cors',
//       'sec-fetch-site': 'same-site',
//     },
//   })
//   sleep(11.5)

//   response = http.post(
//     'https://pizza-service.pizza324.click/api/order',
//     '{"items":[{"menuId":1,"description":"Veggie","price":0.0038},{"menuId":2,"description":"Pepperoni","price":0.0042}],"storeId":"1","franchiseId":1}',
//     {
//       headers: {
//         accept: '*/*',
//         'accept-encoding': 'gzip, deflate, br, zstd',
//         'accept-language': 'en-US,en;q=0.9',
//         authorization: `Bearer ${vars['token']}`,
//         'content-type': 'application/json',
//         origin: 'https://pizza.pizza324.click',
//         priority: 'u=1, i',
//         'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
//         'sec-ch-ua-mobile': '?0',
//         'sec-ch-ua-platform': '"macOS"',
//         'sec-fetch-dest': 'empty',
//         'sec-fetch-mode': 'cors',
//         'sec-fetch-site': 'same-site',
//       },
//     }
//   )

//   vars['jwt'] = jsonpath.query(response.json(), '$.jwt')[0]
//   sleep(3.2)

//   response = http.post(
//     'https://pizza-factory.cs329.click/api/order/verify',
//     {'jwt': vars['jwt']},
//     {
//       headers: {
//         accept: '*/*',
//         'accept-encoding': 'gzip, deflate, br, zstd',
//         'accept-language': 'en-US,en;q=0.9',
//         authorization: `Bearer ${vars['token']}`,
//         'content-type': 'application/json',
//         origin: 'https://pizza.pizza324.click',
//         priority: 'u=1, i',
//         'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
//         'sec-ch-ua-mobile': '?0',
//         'sec-ch-ua-platform': '"macOS"',
//         'sec-fetch-dest': 'empty',
//         'sec-fetch-mode': 'cors',
//         'sec-fetch-site': 'cross-site',
//         'sec-fetch-storage-access': 'active',
//       },
//     }
//   )
// }