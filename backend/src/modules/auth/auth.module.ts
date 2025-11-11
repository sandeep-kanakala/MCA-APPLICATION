import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategy/jwt.strategy';
import { MailUtils } from '@/utils/mailutils';
import { ResetPasswordJwtStrategy } from './strategy/ResetPasswordStrategy';
import { MicrosoftStrategy } from './strategy/microsoft.strategy';
import { RepositoriesModule } from '@/infrastructure/repositories/repositories.module';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: {
          expiresIn: '1hr',
        },
      }),
    }),
    RepositoriesModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    MailUtils,
    ResetPasswordJwtStrategy,
    MicrosoftStrategy,
  ],
  exports: [JwtModule],
})
export class AuthModule {}
