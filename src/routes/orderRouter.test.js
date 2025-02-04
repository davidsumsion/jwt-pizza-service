const request = require('supertest');
const app = require('../service');
const {DB} = require('../database/database')
const {Role} = require('../model/model')
const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
const admin = { email: 'a@jwt.com', password: 'admin', name: '常用名字' };



let defaultAdminAuthToken;

if (process.env.VSCODE_INSPECTOR_OPTIONS) {
    jest.setTimeout(60 * 1000 * 5); // 5 minutes
}

const testFranchise = {
    "stores": [],
    "id": "",
    "name": "newFranchise1234",
    "admins": []
}

function randomName() {
    return Math.random().toString(36).substring(2, 12);
  }

async function createAdminUser() {
  let user = { password: 'toomanysecrets', roles: [{ role: Role.Admin }] };
  user.name = randomName();
  user.email = user.name + '@admin.com';

  user = await DB.addUser(user);
  return { ...user, password: 'toomanysecrets' };
}

beforeAll(async () => {
    const user = await createAdminUser();
    console.log('USER, PASSWORD', user);
    const loginRes = await request(app).put('/api/auth').send(user);
    console.log("LOGGED IN ADMIN:", loginRes.body);
    defaultAdminAuthToken = loginRes.body.token;
});

test('add an item to the menu', async () => {
    const item = { "title":'myItem' + Math.random().toString(36).substring(2, 12), "description": "No topping, no sauce, just carbs", "image":"pizza9.png", "price": 0.0001 }
    const addItemReq = await request(app).put('/api/order/menu').set('Authorization', `Bearer ${defaultAdminAuthToken}`).send(item);
    expect(addItemReq.status).toBe(200);
    let isSuccessful = false
    addItemReq.body.forEach(dbItem => {
        if (dbItem.title === item.title) isSuccessful = true
    });
    expect(isSuccessful).toBe(true);
});

test('create an Order', async () => {
    // create a franchise
    testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com'
    const registerRes = await request(app).post('/api/auth').send(testUser);
    testUserAuthToken = registerRes.body.token;
    testFranchise.admins.push({email: testUser.email});
    testFranchise.name = Math.random().toString(36).substring(2, 12)
    const makeReq = await request(app).post('/api/franchise').set('Authorization', `Bearer ${defaultAdminAuthToken}`).send(testFranchise);
    expect(makeReq.status).toBe(200);

    // create a store
    const newStore = {"franchiseId": makeReq.body.id, "name":Math.random().toString(36).substring(2, 12)}
    const newStoreReq = await request(app).post('/api/franchise/' + makeReq.body.id + '/store').set('Authorization', `Bearer ${defaultAdminAuthToken}`).send(newStore);
    expect(newStoreReq.status).toBe(200);

    // // create an item
    const item = { "title":'myItem2' + Math.random().toString(36).substring(2, 20), "description": "No toppings, no sauces, just carb", "image":"pizza9.png", "price": 0.50 }
    const addItemReq = await request(app).put('/api/order/menu').set('Authorization', `Bearer ${defaultAdminAuthToken}`).send(item);
    console.log('addItemREq', addItemReq.body);
    expect(addItemReq.status).toBe(200);

    const orderMetaData = {"franchiseId": makeReq.body.id, "storeId":newStoreReq.body.franchiseId, "items":[{ "menuId": 1, ...item}]}
    const orderReq = await request(app).post('/api/order').set('Authorization', `Bearer ${defaultAdminAuthToken}`).send(orderMetaData);
    expect(addItemReq.status).toBe(200);
})