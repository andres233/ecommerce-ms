/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { util, configure } from 'protobufjs/minimal';
import * as Long from 'long';
import { Observable } from 'rxjs';
import { PaginationObject, PaginateRequest } from './common.pb';

export const protobufPackage = 'order';

export interface CreateOrderRequest {
  productId: number;
  quantity: number;
  userId: number;
}

export interface CreateOrderResponse {
  status: number;
  error: string[];
  id: string;
}

export interface ProductDetail {
  id: number;
  /** Cambia esto según tus necesidades */
  name: string;
  sku: string;
}

export interface FindOneData {
  id: string;
  createdAt: string;
  quantity: number;
  price: number;
  product: ProductDetail | undefined;
}

export interface FindOneRequest {
  id: string;
}

export interface FindOneResponse {
  status: number;
  error: string[];
  data: FindOneData | undefined;
}

export interface FindAllResponse {
  status: number;
  error: string[];
  data: FindOneData[];
  pagination: PaginationObject | undefined;
}

export const ORDER_PACKAGE_NAME = 'order';

export interface OrderServiceClient {
  createOrder(request: CreateOrderRequest): Observable<CreateOrderResponse>;

  findAll(request: PaginateRequest): Observable<FindAllResponse>;
}

export interface OrderServiceController {
  createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> | Observable<CreateOrderResponse> | CreateOrderResponse;

  findAll(request: PaginateRequest): Promise<FindAllResponse> | Observable<FindAllResponse> | FindAllResponse;
}

export function OrderServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ['createOrder', 'findAll'];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod('OrderService', method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod('OrderService', method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const ORDER_SERVICE_NAME = 'OrderService';

// If you get a compile-error about 'Constructor<Long> and ... have no overlap',
// add '--ts_proto_opt=esModuleInterop=true' as a flag when calling 'protoc'.
if (util.Long !== Long) {
  util.Long = Long as any;
  configure();
}
