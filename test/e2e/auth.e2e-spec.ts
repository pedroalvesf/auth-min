import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestAppHelper } from '../helpers/test-app.helper';
import { AuthHelper } from '../helpers/auth.helper';
import { DatabaseHelper } from '../helpers/database.helper';
import { PrismaService } from '../../src/infra/database/prisma/prisma.service';

describe('Authentication E2E', () => {
  let app: INestApplication;
  let authHelper: AuthHelper;
  let databaseHelper: DatabaseHelper;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await TestAppHelper.createTestApp();
    authHelper = new AuthHelper(app);
    prisma = app.get<PrismaService>(PrismaService);
    databaseHelper = new DatabaseHelper(prisma);
  });

  afterAll(async () => {
    await TestAppHelper.closeApp();
  });

  beforeEach(async () => {
    await databaseHelper.cleanup();
    await databaseHelper.seed();
  });

  // ─────────────────────────────────────────────
  // POST /auth/user
  // ─────────────────────────────────────────────
  describe('POST /auth/user', () => {
    it('should create user, return valid tokens, and persist device', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/user')
        .set(authHelper.getDefaultDeviceHeaders())
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(typeof response.body.accessToken).toBe('string');
      expect(typeof response.body.refreshToken).toBe('string');
      expect(response.body.accessToken.length).toBeGreaterThan(10);

      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(user).toBeTruthy();
      expect(user!.name).toBe(userData.name);
      expect(user!.isActive).toBe(true);

      const device = await prisma.device.findFirst({
        where: { userId: user!.id },
      });
      expect(device).toBeTruthy();
      expect(device!.type).toBe('desktop');
      expect(device!.active).toBe(true);
    });

    it('should not expose password hash in the HTTP response', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/user')
        .set(authHelper.getDefaultDeviceHeaders())
        .send({
          email: 'safe@example.com',
          password: 'Password123!',
          name: 'Safe User',
        })
        .expect(201);

      const bodyStr = JSON.stringify(response.body);
      expect(bodyStr).not.toContain('password');
      expect(bodyStr).not.toContain('Password123!');
    });

    it('should fail with 409 when email already exists', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'Password123!',
        name: 'First User',
      };

      await request(app.getHttpServer())
        .post('/auth/user')
        .set(authHelper.getDefaultDeviceHeaders())
        .send(userData)
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/user')
        .set(authHelper.getDefaultDeviceHeaders())
        .send({ ...userData, name: 'Second User' })
        .expect(409);
    });

    it('should fail with 400 when all device headers are missing', async () => {
      await request(app.getHttpServer())
        .post('/auth/user')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          name: 'User',
        })
        .expect(400);
    });

    it('should fail with 400 when x-ipaddress header is missing', async () => {
      const headers = authHelper.getDefaultDeviceHeaders();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { 'x-ipaddress': _removed, ...headersWithoutIp } = headers;

      await request(app.getHttpServer())
        .post('/auth/user')
        .set(headersWithoutIp)
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          name: 'User',
        })
        .expect(400);
    });
  });

  // ─────────────────────────────────────────────
  // POST /login
  // ─────────────────────────────────────────────
  describe('POST /login', () => {
    it('should return valid tokens on correct credentials', async () => {
      const userData = {
        email: 'login@example.com',
        password: 'Password123!',
        name: 'Login User',
      };
      await authHelper.createUser(userData);

      const response = await request(app.getHttpServer())
        .post('/login')
        .set(authHelper.getMobileDeviceHeaders())
        .send({ email: userData.email, password: userData.password })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(typeof response.body.accessToken).toBe('string');
    });

    it('should create an independent device session per login', async () => {
      const userData = {
        email: 'multidevice@example.com',
        password: 'Password123!',
        name: 'Multi User',
      };
      await authHelper.createUser(userData);

      await request(app.getHttpServer())
        .post('/login')
        .set(authHelper.getMobileDeviceHeaders())
        .send({ email: userData.email, password: userData.password })
        .expect(201);

      const user = await prisma.user.findUnique({
        where: { email: userData.email },
        include: { Devices: true },
      });

      expect(user!.Devices).toHaveLength(2);
      const deviceTypes = user!.Devices.map((d) => d.type);
      expect(deviceTypes).toContain('desktop');
      expect(deviceTypes).toContain('mobile');

      const refreshTokens = await prisma.refreshToken.findMany({
        where: { userId: user!.id },
      });
      expect(refreshTokens).toHaveLength(2);
    });

    it('should fail with 401 on wrong password', async () => {
      const userData = {
        email: 'valid@example.com',
        password: 'Password123!',
        name: 'Valid User',
      };
      await authHelper.createUser(userData);

      await request(app.getHttpServer())
        .post('/login')
        .set(authHelper.getDefaultDeviceHeaders())
        .send({ email: userData.email, password: 'WrongPassword!' })
        .expect(401);
    });

    it('should fail with 401 for non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/login')
        .set(authHelper.getDefaultDeviceHeaders())
        .send({ email: 'ghost@example.com', password: 'Password123!' })
        .expect(401);
    });
  });

  // ─────────────────────────────────────────────
  // DELETE /revoke-device-session
  // ─────────────────────────────────────────────
  describe('DELETE /revoke-device-session', () => {
    it('should deactivate the device and revoke its refresh token', async () => {
      const userData = {
        email: 'revoke@example.com',
        password: 'Password123!',
        name: 'Revoke User',
      };
      const { accessToken } = await authHelper.createUser(userData);

      const user = await prisma.user.findUnique({
        where: { email: userData.email },
        include: { Devices: true },
      });
      const deviceId = user!.Devices[0].id;

      const tokenBefore = await prisma.refreshToken.findFirst({
        where: { deviceId },
      });
      expect(tokenBefore).toBeTruthy();
      expect(tokenBefore!.revoked).toBe(false);

      const response = await request(app.getHttpServer())
        .delete('/revoke-device-session')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ deviceId })
        .expect(200);

      expect(response.body.success).toBe(true);

      const device = await prisma.device.findUnique({
        where: { id: deviceId },
      });
      expect(device!.active).toBe(false);

      const tokenAfter = await prisma.refreshToken.findFirst({
        where: { deviceId },
      });
      expect(tokenAfter!.revoked).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .delete('/revoke-device-session')
        .send({ deviceId: 'some-device-id' })
        .expect(401);
    });

    it('should return 404 when trying to revoke another users device', async () => {
      const userA = {
        email: 'userA@example.com',
        password: 'Password123!',
        name: 'User A',
      };
      const userB = {
        email: 'userB@example.com',
        password: 'Password123!',
        name: 'User B',
      };

      await authHelper.createUser(userA);
      const { accessToken: tokenB } = await authHelper.createUser(userB);

      const foundUserA = await prisma.user.findUnique({
        where: { email: userA.email },
        include: { Devices: true },
      });
      const deviceIdOfUserA = foundUserA!.Devices[0].id;

      await request(app.getHttpServer())
        .delete('/revoke-device-session')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ deviceId: deviceIdOfUserA })
        .expect(404);
    });

    it('should return 404 with a non-existent deviceId', async () => {
      const { accessToken } = await authHelper.createUser({
        email: 'owner@example.com',
        password: 'Password123!',
        name: 'Owner',
      });

      await request(app.getHttpServer())
        .delete('/revoke-device-session')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ deviceId: '00000000-0000-0000-0000-000000000000' })
        .expect(404);
    });
  });

  // ─────────────────────────────────────────────
  // POST /logout/:userId
  // ─────────────────────────────────────────────
  describe('POST /logout/:userId', () => {
    it('should deactivate all devices and revoke all refresh tokens', async () => {
      const userData = {
        email: 'logout@example.com',
        password: 'Password123!',
        name: 'Logout User',
      };
      const { accessToken } = await authHelper.createUser(userData);

      await request(app.getHttpServer())
        .post('/login')
        .set(authHelper.getMobileDeviceHeaders())
        .send({ email: userData.email, password: userData.password })
        .expect(201);

      const user = await prisma.user.findUnique({
        where: { email: userData.email },
        include: { Devices: true },
      });
      expect(user!.Devices).toHaveLength(2);

      const response = await request(app.getHttpServer())
        .post(`/logout/${user!.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();

      const updatedDevices = await prisma.device.findMany({
        where: { userId: user!.id },
      });
      const activeDevices = updatedDevices.filter((d) => d.active);
      expect(activeDevices).toHaveLength(0);

      const refreshTokens = await prisma.refreshToken.findMany({
        where: { userId: user!.id },
      });
      const activeTokens = refreshTokens.filter((t) => !t.revoked);
      expect(activeTokens).toHaveLength(0);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/logout/some-user-id')
        .expect(401);
    });
  });

  // ─────────────────────────────────────────────
  // Access Control
  // ─────────────────────────────────────────────
  describe('Access Control', () => {
    it('should return 200 for admin with roles:read on GET /roles', async () => {
      const { accessToken } = await authHelper.createUserWithRole(
        { email: 'admin@example.com', password: 'Password123!', name: 'Admin' },
        'admin'
      );

      const response = await request(app.getHttpServer())
        .get('/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.roles).toBeDefined();
      expect(Array.isArray(response.body.roles)).toBe(true);
      expect(typeof response.body.total).toBe('number');
    });

    it('should return 403 for user without roles:read on GET /roles', async () => {
      const { accessToken } = await authHelper.createUserWithRole(
        {
          email: 'user@example.com',
          password: 'Password123!',
          name: 'Regular User',
        },
        'user'
      );

      await request(app.getHttpServer())
        .get('/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });

    it('should return 403 for manager without roles:read on GET /roles', async () => {
      const { accessToken } = await authHelper.createUserWithRole(
        {
          email: 'manager@example.com',
          password: 'Password123!',
          name: 'Manager',
        },
        'manager'
      );

      await request(app.getHttpServer())
        .get('/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });

    it('should return 401 for unauthenticated request on GET /roles', async () => {
      await request(app.getHttpServer()).get('/roles').expect(401);
    });

    it('should return 201 for admin with roles:create on POST /roles', async () => {
      const { accessToken } = await authHelper.createUserWithRole(
        {
          email: 'admin-create@example.com',
          password: 'Password123!',
          name: 'Admin Creator',
        },
        'admin'
      );

      const response = await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'New Role', level: 5, assignableRoles: [] })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('New Role');
      expect(response.body.level).toBe(5);
    });

    it('should return 403 for user without roles:create on POST /roles', async () => {
      const { accessToken } = await authHelper.createUserWithRole(
        {
          email: 'user-create@example.com',
          password: 'Password123!',
          name: 'Regular User',
        },
        'user'
      );

      await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Unauthorized Role', level: 5 })
        .expect(403);
    });
  });

  // ─────────────────────────────────────────────
  // Full Authentication Cycle
  // ─────────────────────────────────────────────
  describe('Full Authentication Cycle', () => {
    it('should create user, access protected resource, and complete logout', async () => {
      const userData = {
        email: 'cycle@example.com',
        password: 'Password123!',
        name: 'Cycle User',
      };

      // 1. Cadastro
      const { accessToken } = await authHelper.createUser(userData);
      expect(accessToken).toBeDefined();

      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(user).toBeTruthy();

      // 2. Login em outro device com as mesmas credenciais
      const loginResponse = await request(app.getHttpServer())
        .post('/login')
        .set(authHelper.getMobileDeviceHeaders())
        .send({ email: userData.email, password: userData.password })
        .expect(201);

      expect(loginResponse.body.accessToken).toBeDefined();
      expect(loginResponse.body.accessToken).not.toBe(accessToken);

      // 3. Verifica que existem 2 devices ativos
      const devices = await prisma.device.findMany({
        where: { userId: user!.id, active: true },
      });
      expect(devices).toHaveLength(2);

      // 4. Logout global com o token original
      const logoutResponse = await request(app.getHttpServer())
        .post(`/logout/${user!.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(logoutResponse.body.success).toBe(true);

      // 5. Verifica que todos os devices e tokens foram revogados
      const activeDevices = await prisma.device.findMany({
        where: { userId: user!.id, active: true },
      });
      expect(activeDevices).toHaveLength(0);

      const activeTokens = await prisma.refreshToken.findMany({
        where: { userId: user!.id, revoked: false },
      });
      expect(activeTokens).toHaveLength(0);
    });
  });
});
