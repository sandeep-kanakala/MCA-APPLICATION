import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Param,
  UseGuards,
  Query,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuditEntity } from '@/audit/decorators/audit-log.decorator';
import { LoadEntityInterceptor } from '@/audit/interceptor/load-entity.interceptor';
import type { Response } from '@/utils/response.builder';
import type { AuthenticatedRequest } from '~/interface';
import {
  OrderCreateRequestDto,
  OrderItemCreateRequestDto,
  OrderItemUpdateRequestDto,
  OrderUpdateRequestDto,
  OrderItemReplaceRequestDto,
} from './dto';
import { OrderService } from './order.service';
import {
  AddOrderItemsApiBody,
  AddOrderItemsApiResponses,
  ApiMethodDescription,
  CancelOrderApiResponses,
  CreateOrderApiBody,
  CreateOrderApiResponses,
  GetOrderByIdApiResponses,
  GetOrderItemApiResponses,
  GetOrdersListApiResponses,
  OrderApiQueries,
  RemoveOrderItemApiResponses,
  ReplaceOrderItemApiBody,
  ReplaceOrderItemApiResponses,
  SubmitOrderApiResponses,
  UpdateOrderApiBody,
  UpdateOrderApiResponses,
  UpdateOrderItemApiResponses,
} from '@/common/responses';
import { OrdersQueryDto } from '@/common';
import { toBoolean } from '@/utils';

@ApiTags('Order')
@UseInterceptors(LoadEntityInterceptor)
@Controller('/orders')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@AuditEntity('Order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiMethodDescription('create new order / cart')
  @CreateOrderApiResponses()
  @CreateOrderApiBody()
  async create(
    @Body() createOrderDto: OrderCreateRequestDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return await this.orderService.createOrder(createOrderDto, request);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiMethodDescription('Get Orders', 'Retrieve paginated list of orders')
  @GetOrdersListApiResponses()
  @OrderApiQueries()
  async listByTenantId(
    @Request() request: AuthenticatedRequest,
    @Query() query: OrdersQueryDto,
  ): Promise<Response> {
    return await this.orderService.getAllOrdersByAccountId(
      request,
      query.page,
      query.limit,
      query.accountId,
      toBoolean(query.isArchived),
      query.sortByField,
      query.status,
      query.search,
      query.fromDate,
      query.toDate,
      query.sortOrder,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get('/:orderId')
  @ApiMethodDescription('Get Order by ID', 'Retrieve order details by ID')
  @GetOrderByIdApiResponses()
  async getOrder(
    @Param('orderId') orderId: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return await this.orderService.getOrderById(request, orderId);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('/:orderId')
  @ApiMethodDescription('Update Order by ID')
  @UpdateOrderApiResponses()
  @UpdateOrderApiBody()
  async update(
    @Param('orderId') orderId: string,
    @Body() updateOrderDto: OrderUpdateRequestDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return await this.orderService.updateOrderById(
      orderId,
      updateOrderDto,
      request,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Delete('/:orderId')
  @ApiMethodDescription('Delete Order by ID')
  @CancelOrderApiResponses()
  async archive(
    @Param('orderId') orderId: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return await this.orderService.archiveOrderById(orderId, request);
  }

  //API ENDPOINTS FOR ORDER-ITEMS
  @HttpCode(HttpStatus.OK)
  @Post('/item')
  @ApiMethodDescription('Add Order Items to order')
  @AddOrderItemsApiBody()
  @AddOrderItemsApiResponses()
  @AuditEntity('OrderItem')
  async addOrderItems(
    @Body() data: OrderItemCreateRequestDto | OrderItemCreateRequestDto[],
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.orderService.addOrderItems(data, request);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/item/:OrderItemId')
  @ApiMethodDescription('Get Order Item By ID')
  @GetOrderItemApiResponses()
  async getOrderItem(
    @Param('OrderItemId') OrderItemId: string,
  ): Promise<Response> {
    return this.orderService.getOrderItemById(OrderItemId);
  }

  @HttpCode(HttpStatus.OK)
  @AuditEntity('OrderItem')
  @Patch('/item/:OrderItemId')
  @ApiMethodDescription('Update the Order Item by ID')
  @UpdateOrderItemApiResponses()
  async updateOrderItem(
    @Param('OrderItemId') itemId: string,
    @Body() orderItemUpdateRequestDto: OrderItemUpdateRequestDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.orderService.updateOrderItemById(
      itemId,
      orderItemUpdateRequestDto,
      request,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Delete('/item/:OrderItemId')
  @AuditEntity('OrderItem')
  @ApiMethodDescription('cancel Order-item by ID')
  @RemoveOrderItemApiResponses()
  async removeOrderItem(
    @Param('OrderItemId') itemId: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.orderService.removeOrderItemById(itemId, request);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/item/replace')
  @ApiMethodDescription('Replace Order Item')
  @ReplaceOrderItemApiResponses()
  @ReplaceOrderItemApiBody()
  @AuditEntity('OrderItem')
  async replaceOrderItem(
    @Body() replaceRequestDto: OrderItemReplaceRequestDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.orderService.replaceOrderItem(replaceRequestDto, request);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/:orderId')
  @ApiMethodDescription('checkout / submit the order to icx')
  @SubmitOrderApiResponses()
  @AuditEntity('OrderItem')
  async submitOrder(
    @Param('orderId') orderId: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.orderService.submitOrder(orderId, request);
  }
}
