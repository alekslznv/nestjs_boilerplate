import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

function createJwtProvider(
  provide: string,
  secretKey: string,
  expiresIn: JwtSignOptions['expiresIn'],
) {
  return {
    provide,
    useFactory: (config: ConfigService) =>
      new JwtService({
        secret: config.getOrThrow(secretKey),
        signOptions: { expiresIn },
      }),
    inject: [ConfigService],
  };
}

export const ACCESS_JWT = 'ACCESS_JWT_SERVICE';
export const REFRESH_JWT = 'REFRESH_JWT_SERVICE';

export const jwtProviders = [
  createJwtProvider(ACCESS_JWT, 'JWT_SECRET', '15m'),
  createJwtProvider(REFRESH_JWT, 'JWT_REFRESH_SECRET', '7d'),
];
