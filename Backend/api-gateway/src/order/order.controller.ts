import { Controller, Inject, Post, OnModuleInit, UseGuards, Req, Body, Get, Query } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { CreateOrderResponse, OrderServiceClient, ORDER_SERVICE_NAME, CreateOrderRequest, FindAllResponse } from './order.pb';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { CreateOrderRequestDto } from './order.dto';
import { PaginateRequest } from './common.pb';

@ApiTags('Orders')
@Controller('order')
export class OrderController implements OnModuleInit {
  private svc: OrderServiceClient;

  @Inject(ORDER_SERVICE_NAME)
  private readonly client: ClientGrpc;

  public onModuleInit(): void {
    this.svc = this.client.getService<OrderServiceClient>(ORDER_SERVICE_NAME);
  }

  @Post()
  @UseGuards(AuthGuard)
  private async createOrder(@Body() body: CreateOrderRequestDto): Promise<Observable<CreateOrderResponse>> {
    return this.svc.createOrder(body);
  }

  @Get()
  @UseGuards(AuthGuard)
  private async findAll(@Query() query:PaginateRequest): Promise<Observable<FindAllResponse>>{
    return this.svc.findAll(query);
  }
}