import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ORDER_SERVICE_NAME, ORDER_PACKAGE_NAME } from './order.pb';
import { OrderController } from './order.controller';
import { envs } from 'src/config';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: ORDER_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          url: envs.url_grpc_order_service,
          package: ORDER_PACKAGE_NAME,
          protoPath: 'node_modules/common-proto/proto/order.proto',
        },
      },
    ]),
  ],
  controllers: [OrderController],
})
export class OrderModule {}