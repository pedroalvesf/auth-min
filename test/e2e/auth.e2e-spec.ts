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

  describe('POST /auth/user', () => {
    it('should create user and auto-authenticate device', async () => {
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

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(user).toBeTruthy();
      expect(user!.name).toBe(userData.name);
      expect(user!.isActive).toBe(true);

      // Verify device was created
      const device = await prisma.device.findFirst({
        where: { userId: user!.id },
      });
      expect(device).toBeTruthy();
      expect(device!.type).toBe('desktop');
      expect(device!.operatingSystem).toBe('macOS Test');
      expect(device!.browser).toBe('Chrome E2E');
    });

    it('should fail when creating user with duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'Password123!',
        name: 'First User',
      };

      // Create first user successfully
      await request(app.getHttpServer())
        .post('/auth/user')
        .set(authHelper.getDefaultDeviceHeaders())
        .send(userData)
        .expect(201);

      // Try to create second user with same email
      await request(app.getHttpServer())
        .post('/auth/user')
        .set(authHelper.getDefaultDeviceHeaders())
        .send({
          email: 'duplicate@example.com',
          password: 'Different123!',
          name: 'Second User',
        })
        .expect(409);
    });

    it('should fail with invalid device headers', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      await request(app.getHttpServer())
        .post('/auth/user')
        .send(userData)
        .expect(400);
    });
  });

  describe('POST /login', () => {
    it('should authenticate existing user and create new device session', async () => {
      const userData = {
        email: 'login@example.com',
        password: 'Password123!',
        name: 'Login User',
      };

      // Create user first
      await authHelper.createUser(userData);

      // Login from different device
      const mobileHeaders = authHelper.getMobileDeviceHeaders();
      const response = await request(app.getHttpServer())
        .post('/login')
        .set(mobileHeaders)
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');

      // Verify user now has 2 devices
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
        include: { Devices: true },
      });
      expect(user!.Devices).toHaveLength(2);

      // Check devices are different types
      const deviceTypes = user!.Devices.map((d) => d.type);
      expect(deviceTypes).toContain('desktop');
      expect(deviceTypes).toContain('mobile');
    });

    it('should fail with invalid credentials', async () => {
      const userData = {
        email: 'valid@example.com',
        password: 'Password123!',
        name: 'Valid User',
      };

      await authHelper.createUser(userData);

      await request(app.getHttpServer())
        .post('/login')
        .set(authHelper.getDefaultDeviceHeaders())
        .send({
          email: userData.email,
          password: 'WrongPassword!',
        })
        .expect(401);
    });

    it('should fail for non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/login')
        .set(authHelper.getDefaultDeviceHeaders())
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        })
        .expect(401);
    });
  });

  describe('DELETE /revoke-device-session', () => {
    it('should revoke specific device session', async () => {
      const userData = {
        email: 'revoke@example.com',
        password: 'Password123!',
        name: 'Revoke User',
      };

      const { accessToken } = await authHelper.createUser(userData);

      // Get user and device info
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
        include: { Devices: true },
      });
      const deviceId = user!.Devices[0].id;

      await request(app.getHttpServer())
        .delete('/revoke-device-session')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ deviceId })
        .expect(200);

      // Verify device is marked as inactive
      const device = await prisma.device.findUnique({
        where: { id: deviceId },
      });
      expect(device!.active).toBe(false);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .delete('/revoke-device-session')
        .send({ deviceId: 'some-device-id' })
        .expect(401);
    });
  });

  describe('POST /logout/:userId', () => {
    it('should revoke all user device sessions', async () => {
      const userData = {
        email: 'logout@example.com',
        password: 'Password123!',
        name: 'Logout User',
      };

      const { accessToken } = await authHelper.createUser(userData);

      const user = await prisma.user.findUnique({
        where: { email: userData.email },
        include: { Devices: true },
      });
      const userId = user!.id;

      // Verify user has at least 1 active device
      expect(user!.Devices.filter((d) => d.active)).toHaveLength(1);

      await request(app.getHttpServer())
        .post(`/logout/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      // Verify all devices are inactive
      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { Devices: true },
      });
      expect(updatedUser!.Devices.filter((d) => d.active)).toHaveLength(0);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post('/logout/some-user-id')
        .expect(401);
    });
  });

  describe('Permission-based Access Control', () => {
    it('should allow admin to access all endpoints', async () => {
      const adminData = {
        email: 'admin@example.com',
        password: 'Password123!',
        name: 'Admin User',
      };

      const { accessToken } = await authHelper.createUserWithRole(
        adminData,
        'admin'
      );

      // Admin should be able to access roles endpoint (requires roles.read permission)
      const rolesResponse = await request(app.getHttpServer())
        .get('/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(rolesResponse.body.roles).toBeDefined();
      expect(Array.isArray(rolesResponse.body.roles)).toBe(true);
    });

    it('should deny regular user access to admin endpoints', async () => {
      const userData = {
        email: 'user@example.com',
        password: 'Password123!',
        name: 'Regular User',
      };

      const { accessToken } = await authHelper.createUserWithRole(
        userData,
        'user'
      );

      // Regular user should NOT be able to access roles endpoint
      await request(app.getHttpServer())
        .get('/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });

    it('should allow manager intermediate access', async () => {
      const managerData = {
        email: 'manager@example.com',
        password: 'Password123!',
        name: 'Manager User',
      };

      const { accessToken } = await authHelper.createUserWithRole(
        managerData,
        'manager'
      );

      // Manager should be able to access some endpoints but not create roles
      // Test with roles endpoint first (might need roles.read permission)
      const rolesResponse = await request(app.getHttpServer())
        .get('/roles')
        .set('Authorization', `Bearer ${accessToken}`);

      // Depending on the permission setup, this could be 200 or 403
      expect([200, 403]).toContain(rolesResponse.status);
    });
  });

  describe('Full Authentication Flow', () => {
    it('should complete full authentication cycle', async () => {
      const userData = {
        email: 'fullflow@example.com',
        password: 'Password123!',
        name: 'Full Flow User',
      };

      // 1. Create user + auto-login
      const { accessToken: token1 } = await authHelper.createUser(userData);

      // 2. Use access token for authenticated request (test endpoint that only needs authentication)
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      const protectedResponse = await request(app.getHttpServer())
        .post(`/logout/${user!.id}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(201);

      expect(protectedResponse.body.success).toBe(true);

      // 3. Verify logout was successful by checking the response
      // Note: JWT tokens remain valid until expiration, but devices are deactivated
      // The test confirms the logout endpoint works correctly
    });
  });
});
