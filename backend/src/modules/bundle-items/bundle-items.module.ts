import { Module } from '@nestjs/common';
import { BundleItemsController } from './bundle-items.controller';
import { BundleItemsService } from './bundle-items.service';

@Module({
  controllers: [BundleItemsController],
  providers: [BundleItemsService],
})
export class BundleItemsModule {}
