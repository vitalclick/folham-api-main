import { Global, Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { CommonModule } from '../common/common.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';

@Global()
@Module({
  imports: [
    forwardRef(() => AuthModule),
    CommonModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ActivityLogModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
