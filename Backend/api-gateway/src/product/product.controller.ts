import { Controller, Get, Inject, OnModuleInit, Param, ParseIntPipe, UseGuards, Post, Body, Query } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import {
  FindOneResponse,
  ProductServiceClient,
  PRODUCT_SERVICE_NAME,
  CreateProductResponse,
  CreateProductRequest,
} from './product.pb';
import { AuthGuard } from '../auth/auth.guard';
import { ApiBearerAuth, ApiOkResponse, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CreateProductRequestDto } from './product.dto';
import { PaginateRequest } from './common.pb';
import { PaginationQueryDto } from 'src/common/pagination.dto';

@ApiTags('Products')
@ApiBearerAuth()
@ApiOkResponse()
@ApiUnauthorizedResponse({ description: "Unauthorized Bearer Auth"})
@Controller('product')
export class ProductController implements OnModuleInit {
  private svc: ProductServiceClient;

  @Inject(PRODUCT_SERVICE_NAME)
  private readonly client: ClientGrpc;

  public onModuleInit(): void {
    this.svc = this.client.getService<ProductServiceClient>(PRODUCT_SERVICE_NAME);
  }

  @Post()
  @UseGuards(AuthGuard)
  private async createProduct(@Body() body: CreateProductRequestDto): Promise<Observable<CreateProductResponse>> {
    return this.svc.createProduct(body);
  }

  @Get()
  @UseGuards(AuthGuard)
  private async findAll(@Query() query:PaginationQueryDto) {
    return this.svc.findAll(query);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  private async findOne(@Param('id', ParseIntPipe) id: number): Promise<Observable<FindOneResponse>> {
    return this.svc.findOne({ id });
  }
}
