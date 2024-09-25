import { HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientGrpc } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { Order } from './order.entity';
import { FindOneResponse, DecreaseStockResponse, ProductServiceClient, PRODUCT_SERVICE_NAME } from './proto/product.pb';
import { CreateOrderRequest, CreateOrderResponse, FindAllResponse } from './proto/order.pb';
import { CreateOrderRequestDto } from './order.dto';
import { PaginateRequest, PaginationObject } from './proto/common.pb';

@Injectable()
export class OrderService implements OnModuleInit {
  private productSvc: ProductServiceClient;

  @Inject(PRODUCT_SERVICE_NAME)
  private readonly client: ClientGrpc;

  @InjectRepository(Order)
  private readonly repository: Repository<Order>;

  public onModuleInit(): void {
    this.productSvc = this.client.getService<ProductServiceClient>(PRODUCT_SERVICE_NAME);
  }

  public async createOrder(data: CreateOrderRequestDto): Promise<CreateOrderResponse> {
    const product: FindOneResponse = await firstValueFrom(this.productSvc.findOne({ id: data.productId }));

    if (product.status >= HttpStatus.NOT_FOUND) {
      return { id: null, error: ['Product not found'], status: product.status };
    } else if (product.data.stock < data.quantity) {
      return { id: null, error: ['Stock too less'], status: HttpStatus.CONFLICT };
    }

    const order: Order = new Order();

    order.price = product.data.price;
    order.quantity = data.quantity;
    order.productId = product.data.id;
    order.userId = data.userId;

    await this.repository.save(order);
    const decreasedStockData: DecreaseStockResponse = await firstValueFrom(
      this.productSvc.decreaseStock({ id: data.productId, orderId: order.id , quantity: order.quantity}),
    );

    if (decreasedStockData.status === HttpStatus.CONFLICT) {
      // deleting order if decreaseStock fails
      await this.repository.delete(order);

      return { id: null, error: decreasedStockData.error, status: HttpStatus.CONFLICT };
    }

    return { id: order.id, error: null, status: HttpStatus.OK };
  }

  public async findAll({ page,limit }: PaginateRequest): Promise<FindAllResponse> {
    page = page ?? 1;
    limit = limit ?? 10;
    
    var pagination: PaginationObject;
    pagination = {
      total:await this.repository.count(),
      page,
      perPage:limit,
      from:((page-1) * limit),
      to:0
    };
    const order: Order[] = await this.repository.find({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'ASC', 
      }
    });

    if (!order) {
      return { data: null, error: ['Order not found'], status: HttpStatus.NOT_FOUND, pagination: null };
    }

    pagination.to = pagination.from + order.length;

    if(!order.length){
      pagination.to = 0;
      pagination.from = 0;
    }
    
    const productPromises = order.map(order => 
      firstValueFrom(this.productSvc.findOne({ id: order.productId }))
        .then(productResponse => {
          if (productResponse.status < HttpStatus.NOT_FOUND) {
            return { order, product: productResponse.data };
          }
          return { order, product: null }; // Si el producto no se encuentra
        })
    );

    const ordersWithProducts = await Promise.all(productPromises);

    const orderDtos = ordersWithProducts.map(({ order, product }) => ({
      id: order.id,
      price: order.price,
      quantity: order.quantity,
      productId: order.productId,
      userId: order.userId,
      createdAt: order.createdAt.getTime().toString(), // Conversión aquí
      product
    }));

    return { data: orderDtos, error: null, status: HttpStatus.OK, pagination };
  }
}
