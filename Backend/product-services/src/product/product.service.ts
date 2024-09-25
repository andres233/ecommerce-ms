import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entity/product.entity';
import { CreateProductRequestDto, DecreaseStockRequestDto, FindOneRequestDto } from './product.dto';
import { CreateProductResponse, DecreaseStockResponse, FindAllResponse, FindOneResponse } from './product.pb';
import { StockDecreaseLog } from './entity/stock-decrease-log.entity';
import { PaginateRequest, PaginationObject } from './common.pb';
import { PaginationQueryDto } from 'src/common/pagination.dto';

@Injectable()
export class ProductService {
  @InjectRepository(Product)
  private readonly repository: Repository<Product>;

  @InjectRepository(StockDecreaseLog)
  private readonly decreaseLogRepository: Repository<StockDecreaseLog>;

  public async findOne({ id }: FindOneRequestDto): Promise<FindOneResponse> {
    const product: Product = await this.repository.findOne({ where: { id } });

    if (!product) {
      return { data: null, error: ['Product not found'], status: HttpStatus.NOT_FOUND };
    }

    return { data: product, error: null, status: HttpStatus.OK };
  }

  public async findAll({ page,limit }: PaginationQueryDto): Promise<FindAllResponse> {
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
    const product: Product[] = await this.repository.find({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        id: 'ASC', 
      },
    });

    if (!product) {
      return { data: null, error: ['Product not found'], status: HttpStatus.NOT_FOUND, pagination: null };
    }

    pagination.to = pagination.from + product.length;

    if(!product.length){
      pagination.to = 0;
      pagination.from = 0;
    }
    
    return { data: product, error: null, status: HttpStatus.OK, pagination };
  }

  public async createProduct(payload: CreateProductRequestDto): Promise<CreateProductResponse> {
    const product: Product = new Product();

    product.name = payload.name;
    product.sku = payload.sku;
    product.stock = payload.stock;
    product.price = payload.price;

    await this.repository.save(product);

    return { id: product.id, error: null, status: HttpStatus.OK };
  }

  public async decreaseStock({ id, orderId, quantity }: DecreaseStockRequestDto): Promise<DecreaseStockResponse> {
    const product: Product = await this.repository.findOne({ select: ['id', 'stock'], where: { id } });

    if (!product) {
      return { error: ['Product not found'], status: HttpStatus.NOT_FOUND };
    } else if (product.stock <= 0) {
      return { error: ['Stock too low'], status: HttpStatus.CONFLICT };
    }

    const isAlreadyDecreased: number = await this.decreaseLogRepository.count({ where: { orderId } });

    if (isAlreadyDecreased) {
      // Idempotence
      return { error: ['Stock already decreased'], status: HttpStatus.CONFLICT };
    }
    
    await this.repository.update(product.id, { stock: product.stock - quantity });
    await this.decreaseLogRepository.insert({ product, orderId });

    return { error: null, status: HttpStatus.OK };
  }
}
