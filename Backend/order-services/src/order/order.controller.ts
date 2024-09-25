import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { OrderService } from './order.service';
import { ORDER_SERVICE_NAME, CreateOrderResponse, FindAllResponse } from './proto/order.pb';
import { CreateOrderRequestDto } from './order.dto';
import { PaginateRequest } from './proto/common.pb';

@Controller()
export class OrderController {
  @Inject(OrderService)
  private readonly service: OrderService;

  @GrpcMethod(ORDER_SERVICE_NAME, 'CreateOrder')
  private async createOrder(data: CreateOrderRequestDto): Promise<CreateOrderResponse> {
    return this.service.createOrder(data);
  }

  @GrpcMethod(ORDER_SERVICE_NAME, 'FindAll')
  private findAll(payload: PaginateRequest): Promise<FindAllResponse> {
    return this.service.findAll(payload);
  }
}
