import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export interface DeviceHeaders {
  'x-ipaddress': string;
  'x-operatingsystem': string;
  'x-browser': string;
  'x-type': string;
  [key: string]: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthHelper {
  constructor(private app: INestApplication) {}

  async createUserWithRole(
    userData: CreateUserData,
    roleSlug: 'admin' | 'manager' | 'user' = 'user',
    deviceHeaders?: DeviceHeaders
  ): Promise<AuthTokens & { userId: string }> {
    // First create regular user
    const tokens = await this.createUser(userData, deviceHeaders);

    // Get PrismaService from app to assign role directly
    const { PrismaService } = await import(
      '../../src/infra/database/prisma/prisma.service'
    );
    const prisma = this.app.get(PrismaService);

    // Find the created user
    const user = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!user) {
      throw new Error('User not found after creation');
    }

    // Assign role to user
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: `role-${roleSlug}`,
        assignedAt: new Date(),
        assignedBy: 'system',
      },
    });

    return {
      ...tokens,
      userId: user.id,
    };
  }

  getDefaultDeviceHeaders(): DeviceHeaders {
    return {
      'x-ipaddress': '192.168.1.100',
      'x-operatingsystem': 'macOS Test',
      'x-browser': 'Chrome E2E',
      'x-type': 'desktop',
    };
  }

  getMobileDeviceHeaders(): DeviceHeaders {
    return {
      'x-ipaddress': '192.168.1.101',
      'x-operatingsystem': 'iOS 16',
      'x-browser': 'Safari Mobile',
      'x-type': 'mobile',
    };
  }

  async createUser(
    userData: CreateUserData,
    deviceHeaders?: DeviceHeaders
  ): Promise<AuthTokens> {
    const headers = deviceHeaders || this.getDefaultDeviceHeaders();

    const response = await request(this.app.getHttpServer())
      .post('/auth/user')
      .set(headers)
      .send(userData)
      .expect(201);

    return {
      accessToken: response.body.accessToken,
      refreshToken: response.body.refreshToken,
    };
  }

  async login(
    loginData: LoginData,
    deviceHeaders?: DeviceHeaders
  ): Promise<AuthTokens> {
    const headers = deviceHeaders || this.getDefaultDeviceHeaders();

    const response = await request(this.app.getHttpServer())
      .post('/login')
      .set(headers)
      .send(loginData)
      .expect(201);

    return {
      accessToken: response.body.accessToken,
      refreshToken: response.body.refreshToken,
    };
  }

  async revokeDeviceSession(
    deviceId: string,
    accessToken: string
  ): Promise<void> {
    await request(this.app.getHttpServer())
      .delete('/revoke-device-session')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ deviceId })
      .expect(200);
  }

  async logoutAll(userId: string, accessToken: string): Promise<void> {
    await request(this.app.getHttpServer())
      .post(`/logout/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);
  }

  async makeAuthenticatedRequest(
    method: 'get' | 'post' | 'put' | 'delete',
    endpoint: string,
    accessToken: string,
    data?: Record<string, unknown>
  ) {
    const req = request(this.app.getHttpServer())
      [method](endpoint)
      .set('Authorization', `Bearer ${accessToken}`);

    if (data && (method === 'post' || method === 'put')) {
      req.send(data);
    }

    return req;
  }
}
