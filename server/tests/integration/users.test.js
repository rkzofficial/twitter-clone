const request = require('supertest');
const faker = require('faker');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const {
  getAdminAccessToken,
  getUserOneAccessToken,
} = require('../fixtures/token.fixture');
const {
  admin,
  userOne,
  insertUsers,
  userTwo,
} = require('../fixtures/user.fixture');
const { formatUsername } = require('../../src/utils/helpers');
const { User } = require('../../src/components/users');
const { Profile } = require('../../src/components/profiles');

setupTestDB();

describe('Users routes', () => {
  describe('POST /api/users', () => {
    let newUser;

    beforeEach(() => {
      newUser = {
        name: faker.name.findName(),
        email: faker.internet.email(),
        username: faker.internet.userName(),
        password: 'password123',
        role: 'user',
      };
    });

    it('When data is ok, should return 201 and create new user', async () => {
      await insertUsers([admin]);

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${getAdminAccessToken()}`)
        .send(newUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.user).not.toHaveProperty('password');
      expect(res.body.user).toMatchObject({
        _id: expect.anything(),
        name: newUser.name,
        email: newUser.email.toLowerCase(),
        username: formatUsername(newUser.username),
        role: newUser.role,
      });

      const { _id: userId } = res.body.user;
      const [dbUser, dbProfile] = await Promise.all([
        User.findById(userId),
        Profile.findOne({ user: userId }),
      ]);
      expect(dbUser).toBeDefined();
      expect(dbProfile).toBeDefined();
      expect(dbUser.password).not.toBe(newUser.password);
      expect(dbUser).toMatchObject({
        name: newUser.name,
        email: newUser.email.toLowerCase(),
        username: formatUsername(newUser.username),
        role: newUser.role,
      });
    });

    it('When new user role is admin, should return 201 and create new admin user', async () => {
      await insertUsers([admin]);
      newUser.role = 'admin';

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${getAdminAccessToken()}`)
        .send(newUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.user.role).toBe('admin');

      const { _id: userId } = res.body.user;
      const [dbUser, dbProfile] = await Promise.all([
        User.findById(userId),
        Profile.findOne({ user: userId }),
      ]);
      expect(dbUser).toBeDefined();
      expect(dbProfile).toBeDefined();
      expect(dbUser.role).toBe('admin');
    });

    it('When access token is missing, should return 401 error', async () => {
      const res = await request(app).post('/api/users').send(newUser);

      expect(res.statusCode).toBe(401);
    });

    it('When logged in user is not admin, should return 403 error', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${getUserOneAccessToken()}`)
        .send(newUser);

      expect(res.statusCode).toBe(403);
    });

    it('When name length is invalid, should return 400 error', async () => {
      await insertUsers([admin]);
      newUser.name = 'N   ';

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${getAdminAccessToken()}`)
        .send(newUser);

      expect(res.statusCode).toBe(400);
    });

    it('When username length is invalid, should return 400 error', async () => {
      await insertUsers([admin]);
      newUser.username = 'U   ';

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${getAdminAccessToken()}`)
        .send(newUser);

      expect(res.statusCode).toBe(400);
    });

    it('When password length is invalid, should return 400 error', async () => {
      await insertUsers([admin]);
      newUser.password = 'passwd';

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${getAdminAccessToken()}`)
        .send(newUser);

      expect(res.statusCode).toBe(400);
    });

    it('When email is invalid, should return 400 error', async () => {
      await insertUsers([admin]);
      newUser.email = 'invalidEmail';

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${getAdminAccessToken()}`)
        .send(newUser);

      expect(res.statusCode).toBe(400);
    });

    it('When email is already in use, should return 400 error', async () => {
      await insertUsers([admin, userOne]);
      newUser.email = userOne.email;

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${getAdminAccessToken()}`)
        .send(newUser);

      expect(res.statusCode).toBe(400);
    });

    it('When username is already in use, should return 400 error', async () => {
      await insertUsers([admin, userOne]);
      newUser.username = userOne.username;

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${getAdminAccessToken()}`)
        .send(newUser);

      expect(res.statusCode).toBe(400);
    });

    it('When user role is unknown, should return 400 error', async () => {
      await insertUsers([admin]);
      newUser.role = 'boss';

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${getAdminAccessToken()}`)
        .send(newUser);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/users', () => {
    it('Should return 200 with users and apply the default query options', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${getAdminAccessToken()}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);
    });

    it('When access token is missing, should return 401', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app).get('/api/users');

      expect(res.statusCode).toBe(401);
    });

    it('When non-admin is trying to access all users, should return 403', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${getUserOneAccessToken()}`);

      expect(res.statusCode).toBe(403);
    });

    it('When filter on name field is applied, should return correct results', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${getAdminAccessToken()}`)
        .query({ name: userOne.name });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0]._id).toBe(userOne._id.toString());
    });

    it('When filter on role field is applied, should return correct results', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${getAdminAccessToken()}`)
        .query({ role: 'user' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].role).toBe('user');
      expect(res.body.results[1].role).toBe('user');
    });

    it('When limit param is specified, should limit returned array', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${getAdminAccessToken()}`)
        .query({ limit: 2 });

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 2,
        totalPages: 2,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(2);
    });

    it('When page and limit param are specified, should return correct page', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${getAdminAccessToken()}`)
        .query({ page: 2, limit: 2 });

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 2,
        limit: 2,
        totalPages: 2,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(1);
    });
  });
});
