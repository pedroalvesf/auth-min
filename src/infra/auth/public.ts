import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// Para rotas que precisam lidar com a resposta diretamente
export const PUBLIC_ENDPOINT_KEY = 'publicEndpoint';
export const PublicEndpoint = (path: string) =>
  SetMetadata(PUBLIC_ENDPOINT_KEY, path);
