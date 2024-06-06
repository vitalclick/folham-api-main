import { forwardRef, Global, Module } from '@nestjs/common';
import { EmailService } from './services/email/email.service';
import { QueuesModule } from '../queues/queues.module';
import { MemcacheService } from './services/memcache/memcache.service';

@Global()
@Module({
  imports: [forwardRef(() => QueuesModule)],
  providers: [EmailService, MemcacheService],
  exports: [EmailService, MemcacheService],
})
export class CommonModule {}
