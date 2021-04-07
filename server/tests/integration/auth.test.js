const request = require('supertest');
const faker = require('faker');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { userOne, insertUsers } = require('../fixtures/user.fixture');
const { User } = require('../../src/components/users');
const { Profile } = require('../../src/components/profiles');
const { formatUsername } = require('../../src/utils/helpers');
const charLengthForProps = require('../../src/helpers/charLengthForProps');

setupTestDB();

describe('Auth routes', () => {
  describe('POST /api/auth/register', () => {
    let newUser;
    beforeEach(() => {
      newUser = {
        name: faker.name.findName(),
        email: faker.internet.email(),
        username: faker.internet.userName(),
        password: 'password123',
        repeat_password: 'password123',
      };
    });

    it('When request data is ok, should return 201 and successfully register user', async () => {
      const res = await request(app).post('/api/auth/register').send(newUser);

      expect(res.statusCode).toEqual(201);
      expect(res.body.user).not.toHaveProperty('password');
      expect(res.body.user).toMatchObject({
        _id: expect.anything(),
        role: 'user',
        name: newUser.name,
        username: formatUsername(newUser.username),
        email: newUser.email.toLowerCase(),
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });

      expect(res.body.token).toBeDefined();

      const { id: userId } = res.body.user;
      const [dbUser, dbProfile] = await Promise.all([
        User.findById(userId),
        Profile.findOne({ user: userId }),
      ]);

      expect(dbUser).toBeDefined();
      expect(dbProfile).toBeDefined();
    });

    it('When email is invalid, should return error', async () => {
      newUser.email = 'invalid-email';

      const res = await request(app).post('/api/auth/register').send(newUser);

      expect(res.statusCode).toBe(400);
    });

    it('When email is already in use, should return error', async () => {
      await insertUsers([userOne]);
      newUser.email = userOne.email;

      const res = await request(app).post('/api/auth/register').send(newUser);

      expect(res.statusCode).toBe(400);
    });

    it('When username is already in use, should return error', async () => {
      await insertUsers([userOne]);
      newUser.username = userOne.username;

      const res = await request(app).post('/api/auth/register').send(newUser);

      expect(res.statusCode).toBe(400);
    });

    it(`When password length is less than ${charLengthForProps.password.min}, should return error`, async () => {
      newUser.password = 'passwd1';

      const res = await request(app).post('/api/auth/register').send(newUser);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('When email and password match, should return user and token', async () => {
      await insertUsers([userOne]);

      const loginCredentials = {
        username: userOne.email,
        password: userOne.password,
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginCredentials);

      expect(res.statusCode).toBe(200);

      expect(res.body.user).toMatchObject({
        role: 'user',
        name: userOne.name,
        username: formatUsername(userOne.username),
        email: userOne.email.toLowerCase(),
      });

      expect(res.body.token).toBeDefined();
    });

    it('When there is no users with that email, should return 401', async () => {
      const loginCredentials = {
        username: userOne.email,
        password: userOne.password,
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginCredentials);

      expect(res.statusCode).toBe(401);
    });

    it('When password is wrong, should return 401', async () => {
      await insertUsers([userOne]);

      const loginCredentials = {
        username: userOne.email,
        password: 'wrongPassword123',
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginCredentials);

      expect(res.statusCode).toBe(401);
    });
  });
});
