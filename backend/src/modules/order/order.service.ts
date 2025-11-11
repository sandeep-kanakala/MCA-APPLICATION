import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as winston from 'winston';
import {
  Order,
  OrderStatus,
  Prisma,
  OrderItemAction,
  AccountType,
  OrderItem,
} from '@prisma/client';
import {
  Response,
  ResponseBuilder,
  buildRelations,
  cleanPatchData,
  pickKeys,
  handleError,
} from '@/utils';
import { AuthenticatedRequest } from '~/interface';
import {
  OrderRespository,
  AccountRepository,
} from '@/infrastructure/repositories';
import {
  OrderCreateRequestDto,
  OrderItemCreateRequestDto,
  OrderItemUpdateRequestDto,
  OrderUpdateRequestDto,
  OrderItemReplaceRequestDto,
} from './dto';
import { PriceBookRepository } from '@/infrastructure/repositories/pricebook.repository';
import { ASC, CREATED_AT, DESC } from '@/config/constants';
import { AllowedOrderSortFields } from '@/config/constants/order.constants';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRespository,
    private readonly accountRepository: AccountRepository,
    private readonly priceBookRepository: PriceBookRepository,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: winston.Logger,
  ) {}

  async createOrder(
    data: OrderCreateRequestDto,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;
    this.logger.info(`Creating order for user: ${user.email}`);
    try {
      const foreignKeys = pickKeys(data, [
        'customerId',
        'opportunityId',
        'quoteId',
        'originalOrderId',
        'billingAccountId',
      ]);
      const { customerId, billingAccountId, ...optionalKeys } = foreignKeys;
      const customerAccount = await this.accountRepository.findById(
        customerId,
        AccountType.CUSTOMER,
      );
      if (!customerAccount) {
        throw new BadRequestException('customer Account doesn’t exist.');
      }
      const billingAccount = await this.accountRepository.findById(
        billingAccountId,
        AccountType.PARTNER,
      );
      if (!billingAccount) {
        throw new BadRequestException('Partner account doesn’t exist.');
      }
      const relations = buildRelations(optionalKeys, {
        opportunityId: 'opportunity',
        quoteId: 'quote',
        originalOrderId: 'originalOrder',
      });

      //we will update this based on requirement in future sprints
      const createInput: Prisma.OrderCreateInput = {
        ...data,
        customer: { connect: { id: customerId } },
        tenant: { connect: { id: user.tenantId } },
        createdBy: { connect: { id: user.id } },
        updatedBy: { connect: { id: user.id } },
        billingAccount: { connect: { id: billingAccountId } },
        ...relations,
      };

      const createdOrder = await this.orderRepository.createOrder(createInput);

      return new ResponseBuilder()
        .withMessage('Order created successfully.')
        .withStatusCode(201)
        .withData(createdOrder)
        .build();
    } catch (error: unknown) {
      this.logger.error('Error creating order', { error });
      handleError(error, 'Error creating order.');
    }
  }

  async getAllOrdersByAccountId(
    request: AuthenticatedRequest,
    page?: number,
    limit?: number,
    accountId?: string,
    isArchived: boolean = false,
    sortByField?: string,
    status?: string,
    search?: string,
    fromDate?: Date,
    toDate?: Date,
    sortOrder?: string,
  ): Promise<Response> {
    this.logger.info('Fetching orders');
    try {
      const pageNumber = Math.max(Number(page) || 1, 1);
      const pageSize = Math.max(Number(limit) || 10, 1);
      const skip = (pageNumber - 1) * pageSize;
      const { user } = request;
      const tenantId = user.tenantId;
      const cleanAccountId =
        typeof accountId === 'string' ? accountId.trim() : accountId;
      const cleanStatus = typeof status === 'string' ? status.trim() : status;
      const cleanSearch = typeof search === 'string' ? search.trim() : search;
      const cleanSortOrder =
        typeof sortOrder === 'string' ? sortOrder.trim() : sortOrder;
      const cleanSortByField =
        typeof sortByField === 'string' ? sortByField.trim() : sortByField;
      const sortField =
        AllowedOrderSortFields.find(
          (f) => f.toLowerCase() === cleanSortByField?.toLowerCase(),
        ) || CREATED_AT;
      const order = cleanSortOrder?.toLowerCase() === ASC ? ASC : DESC;

      const whereCondition = this.buildWhereAndFilterClauses(
        cleanSearch,
        fromDate,
        toDate,
        cleanStatus,
      );
      const where = {
        isArchived,
        tenantId,
        ...(cleanAccountId && { accountId: cleanAccountId }),
        ...whereCondition,
      };
      const include = {
        items: true,
      };
      const [totalCount, orders] = await Promise.all([
        this.orderRepository.countOrdersByAccountId(where),
        this.orderRepository.getAllOrdersByAccountId(
          skip,
          pageSize,
          sortField,
          order,
          include,
          where,
        ),
      ]);

      return new ResponseBuilder()
        .withMessage('Orders fetched successfully.')
        .withData({
          total: totalCount,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
          data: orders,
        })
        .build();
    } catch (error: unknown) {
      this.logger.error('Error fetching orders list', { error });
      handleError(error, 'Error fetching orders list.');
    }
  }
  async getOrderById(
    request: AuthenticatedRequest,
    id: string,
  ): Promise<Response> {
    this.logger.info(`Fetching order ID: ${id}`);

    try {
      if (!id || typeof id !== 'string' || id.trim() === '') {
        throw new BadRequestException('Invalid order ID.');
      }
      const { user } = request;
      const include = {
        items: true,
      };
      const order = await this.orderRepository.findOrderById(
        id,
        user.tenantId,
        include,
      );
      if (!order) {
        this.logger.warn(`Order not found: ${id}`);
        throw new NotFoundException('Order not found.');
      }

      return new ResponseBuilder()
        .withMessage('Order fetched successfully.')
        .withData(order)
        .build();
    } catch (error: unknown) {
      this.logger.error(`Error fetching order ID: ${id}`, { error });
      handleError(error, 'Error fetching order by ID.');
    }
  }

  async updateOrderById(
    id: string,
    orderUpdateData: OrderUpdateRequestDto,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;
    this.logger.info(`Updating order ID: ${id} by user: ${user.email}`);

    try {
      if (!id || typeof id !== 'string' || id.trim() === '') {
        throw new BadRequestException('Invalid order ID.');
      }

      const existingOrder = await this.orderRepository.findOrderById(
        id,
        user.tenantId,
      );
      if (!existingOrder) {
        this.logger.warn(`Order not found or already archived: ${id}`);
        throw new NotFoundException('Order not found.');
      }

      const changes = cleanPatchData<Order>(orderUpdateData, existingOrder);
      if (!changes.isChanged) {
        return new ResponseBuilder()
          .withStatusCode(204)
          .withMessage('No changes found.')
          .withData(orderUpdateData)
          .build();
      }
      const updatedOrder = await this.orderRepository.updateOrderById(id, {
        ...changes.cleaned,
        updatedBy: { connect: { id: user.id } },
      });

      return new ResponseBuilder()
        .withMessage('Order updated successfully.')
        .withData(updatedOrder)
        .build();
    } catch (error: unknown) {
      this.logger.error(`Error updating order ID: ${id}`, { error });
      handleError(error, 'Error updating order.');
    }
  }

  async archiveOrderById(
    id: string,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;
    this.logger.info(`Archiving order ID: ${id} by user: ${user.email}`);

    try {
      const existingOrder = await this.orderRepository.findOrderById(
        id,
        user.tenantId,
      );

      if (!existingOrder) {
        this.logger.warn(`Order not found or already archived: ${id}`);
        throw new NotFoundException('Order not found.');
      }

      await this.orderRepository.archiveOrderById(id, {
        isArchived: true,
        archivedAt: new Date(),
        status: OrderStatus.CANCELLED,
        updatedBy: { connect: { id: user.id } },
      });

      return new ResponseBuilder()
        .withStatusCode(204)
        .withMessage('Order archived successfully.')
        .build();
    } catch (error: unknown) {
      this.logger.error(`Error archiving order ID: ${id}`, { error });
      handleError(error, 'Error archiving order.');
    }
  }

  async submitOrder(orderId: string, request: AuthenticatedRequest) {
    const { user } = request;
    const order = await this.orderRepository.findOrderById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found!');
    }
    //we need to connect to outbound api here(ICX)
    const updatedOrder = await this.orderRepository.updateOrderById(orderId, {
      activatedAt: new Date(),
      status: OrderStatus.ACTIVATED,
      updatedBy: { connect: { id: user.id } },
    });
    if (!updatedOrder) {
      throw new Error('Something went wrong!');
    }
    return new ResponseBuilder()
      .withData(updatedOrder)
      .withMessage('order processed successfully')
      .build();
  }

  async addOrderItems(
    data: OrderItemCreateRequestDto | OrderItemCreateRequestDto[],
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;
    const isBulk = Array.isArray(data);
    const items = isBulk ? data : [data];
    const orderId = items[0]?.orderId;

    try {
      this.logger.info(
        `Adding ${isBulk ? 'bulk' : 'single'} order item(s) for order: ${orderId} by user: ${user.email}`,
      );

      if (!items.length) {
        throw new BadRequestException('No order items provided.');
      }
      if (!orderId || typeof orderId !== 'string' || orderId.trim() === '') {
        throw new BadRequestException('Invalid order ID.');
      }
      if (items.some((item) => item.orderId !== orderId)) {
        throw new BadRequestException(
          'All items must belong to the same order.',
        );
      }

      const order = await this.orderRepository.findOrderById(
        orderId,
        user.tenantId,
      );

      if (!order) {
        throw new NotFoundException(`Order not found: ${orderId}`);
      }

      if (order.status === OrderStatus.ACTIVATED) {
        this.logger.warn(`Order already submitted: ${orderId}`);
        throw new ConflictException(
          'Order already submitted and not editable.',
        );
      }

      const priceBookEntryIds = items.map((item) => item.priceBookEntryId);
      const priceBookEntries =
        await this.priceBookRepository.findPriceBookEntriesByIds(
          priceBookEntryIds,
        );
      const priceBookEntryMap = new Map(
        priceBookEntries.map((entry) => [entry.id, entry]),
      );
      const invalidIds = priceBookEntryIds.filter(
        (id) => !priceBookEntryMap.has(id),
      );

      if (invalidIds.length) {
        this.logger.warn(
          `Price book entries not found: ${invalidIds.join(', ')}`,
        );
        throw new NotFoundException(
          `Price book entries not found: ${invalidIds.join(', ')}`,
        );
      }

      const createInputs: Prisma.OrderItemCreateInput[] = items.map((item) => {
        const { priceBookEntryId, discount, quantity, orderId, ...rest } = item;
        const priceBookEntry = priceBookEntryMap.get(priceBookEntryId)!;
        const unitPrice = priceBookEntry.unitPrice;
        const netAmount = new Prisma.Decimal(unitPrice)
          .mul(quantity)
          .sub(discount || 0);
        return {
          ...rest,
          unitPrice,
          discount: discount || 0,
          quantity,
          netAmount,
          priceBookEntry: { connect: { id: priceBookEntryId } },
          order: { connect: { id: orderId } },
        };
      });

      const createdItems =
        await this.orderRepository.createOrderItems(createInputs);

      const orderItems =
        await this.orderRepository.getAllOrderItemsByOrderId(orderId);
      const totalAmount = orderItems.reduce(
        (sum, item) => sum.plus(item.netAmount),
        new Prisma.Decimal(0),
      );

      await this.orderRepository.updateOrderById(orderId, {
        totalAmount,
        updatedBy: { connect: { id: user.id } },
      });

      return new ResponseBuilder()
        .withMessage(`Order item${isBulk ? 's' : ''} added successfully.`)
        .withData({
          records: createdItems,
          actions: { itempricesupdated: true },
        })
        .build();
    } catch (err) {
      this.logger.error('Error adding order items', err);
      handleError(err, 'An error occurred while adding order items.');
    }
  }

  async getOrderItemById(id: string): Promise<Response> {
    this.logger.info(`Fetching order ID: ${id}`);

    try {
      if (!id || typeof id !== 'string' || id.trim() === '') {
        throw new BadRequestException('Invalid order ID.');
      }

      const order = await this.orderRepository.findOrderItemById(id);
      if (!order) {
        this.logger.warn(`Order Item not found: ${id}`);
        throw new NotFoundException('Order Item not found.');
      }

      return new ResponseBuilder()
        .withMessage('Order fetched successfully.')
        .withData(order)
        .build();
    } catch (error: unknown) {
      this.logger.error(`Error fetching order ID: ${id}`, { error });
      handleError(error, 'Error fetching order by ID.');
    }
  }

  async updateOrderItemById(
    id: string,
    orderItemUpdateRequestDto: OrderItemUpdateRequestDto,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;
    this.logger.info(`Updating order item ID: ${id} by user: ${user.email}`);
    try {
      if (!id || typeof id !== 'string' || id.trim() === '') {
        throw new BadRequestException('Invalid order item ID.');
      }

      const existingOrderItem =
        await this.orderRepository.findOrderItemById(id);
      if (!existingOrderItem) {
        this.logger.warn(`Order item not found: ${id}`);
        throw new NotFoundException('Order item not found.');
      }

      const order = await this.orderRepository.findOrderById(
        existingOrderItem.orderId,
      );
      if (!order || order.status === OrderStatus.ACTIVATED) {
        throw new BadRequestException('Order is already submitted');
      }

      const { action, ...updateData } = orderItemUpdateRequestDto;

      // Validate action if provided
      if (action) {
        if (
          action === OrderItemAction.Resume &&
          existingOrderItem.action !== OrderItemAction.Disconnect
        ) {
          throw new BadRequestException(
            'Only disconnected items can be resumed',
          );
        }
        if (
          action === OrderItemAction.Cancel &&
          existingOrderItem.action === OrderItemAction.Cancel
        ) {
          throw new BadRequestException('Item already cancelled');
        }
      }

      const updateInput: Prisma.OrderItemUpdateInput = {
        ...updateData,
        action: action === OrderItemAction.Resume ? null : action,
      };

      const updatedOrderItem = await this.orderRepository.updateOrderItemById(
        id,
        updateInput,
      );
      if (!updatedOrderItem) {
        throw new Error('Something went wrong while updating!');
      }

      if (action || updateData.quantity || updateData.discount) {
        const orderItems = await this.orderRepository.getAllOrderItemsByOrderId(
          existingOrderItem.orderId,
        );
        const activeItems = orderItems.filter(
          (i) => i.action !== OrderItemAction.Cancel,
        );
        const totalAmount = activeItems.reduce(
          (sum, i) => sum.plus(i.netAmount),
          new Prisma.Decimal(0),
        );

        await this.orderRepository.updateOrderById(existingOrderItem.orderId, {
          totalAmount,
          updatedBy: { connect: { id: user.id } },
        });
      }

      return new ResponseBuilder()
        .withMessage('Order Item updated successfully.')
        .withData(updatedOrderItem)
        .build();
    } catch (error: unknown) {
      this.logger.error(`Error updating order item ID: ${id}`, { error });
      handleError(error, 'Error updating order item by ID.');
    }
  }

  async removeOrderItemById(
    id: string,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;
    this.logger.info(`Removing order item ID: ${id} by user: ${user.email}`);
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new BadRequestException('Invalid order item ID.');
    }

    const existingOrderItem = await this.orderRepository.findOrderItemById(id);
    if (!existingOrderItem) {
      this.logger.warn(`Order item not found: ${id}`);
      throw new NotFoundException('Order item not found.');
    }

    await this.orderRepository.updateOrderItemById(id, {
      action: OrderItemAction.Cancel,
    });

    const orderItems = await this.orderRepository.getAllOrderItemsByOrderId(
      existingOrderItem.orderId,
    );
    const totalAmount = orderItems
      .filter((item) => item.action !== OrderItemAction.Cancel)
      .reduce((sum, item) => sum.plus(item.netAmount), new Prisma.Decimal(0));

    await this.orderRepository.updateOrderById(existingOrderItem.orderId, {
      totalAmount,
      updatedBy: { connect: { id: user.id } },
    });

    return new ResponseBuilder()
      .withStatusCode(204)
      .withMessage('Order item removed successfully.')
      .build();
  }

  async replaceOrderItem(
    data: OrderItemReplaceRequestDto,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;
    this.logger.info(
      `Replacing order item for cart: ${data.orderId} by user: ${user.email}`,
    );
    const { orderId, targetPriceBookEntryId, existingOrderItemId } = data;

    const order = await this.orderRepository.findOrderById(
      orderId,
      user.tenantId,
    );
    if (!order || order.status === OrderStatus.ACTIVATED) {
      this.logger.warn(`Order not found or already submitted: ${orderId}`);
      throw new NotFoundException('Order not found or not editable.');
    }

    // Validate existing order item
    const existingItem =
      await this.orderRepository.findOrderItemById(existingOrderItemId);
    if (!existingItem || existingItem.orderId !== orderId) {
      this.logger.warn(
        `Order item not found or does not belong to order: ${existingOrderItemId}`,
      );
      throw new NotFoundException('Order item not found.');
    }

    const priceBookEntry =
      await this.priceBookRepository.findPriceBookEntryById(
        targetPriceBookEntryId,
      );
    if (!priceBookEntry) {
      this.logger.warn(`Price book entry not found: ${targetPriceBookEntryId}`);
      throw new NotFoundException('Price book entry not found.');
    }

    const netAmount = new Prisma.Decimal(priceBookEntry.unitPrice)
      .mul(existingItem.quantity)
      .sub(existingItem.discount || 0);
    const newItemInput: Prisma.OrderItemCreateInput = {
      unitPrice: priceBookEntry.unitPrice,
      discount: existingItem.discount || 0,
      quantity: existingItem.quantity,
      netAmount,
      priceBookEntry: { connect: { id: targetPriceBookEntryId } },
      order: { connect: { id: orderId } },
    };

    const [newItem] = await this.orderRepository.replaceOrderItem(
      newItemInput,
      existingOrderItemId,
    );

    const orderItems =
      await this.orderRepository.getAllOrderItemsByOrderId(orderId);
    const totalAmount = orderItems.reduce(
      (sum, item) => sum.plus(item.netAmount),
      new Prisma.Decimal(0),
    );

    await this.orderRepository.updateOrderById(orderId, {
      totalAmount,
      updatedBy: { connect: { id: user.id } },
    });

    return new ResponseBuilder()
      .withMessage('Order item replaced successfully.')
      .withData({ orderId, newItemId: newItem.id })
      .build();
  }

  async findOne(id: string): Promise<Order | OrderItem | null> {
    return await this.orderRepository.findById(id);
  }

  private buildWhereAndFilterClauses(
    cleanSearch?: string,
    cleanFromDate?: Date,
    cleanToDate?: Date,
    cleanStatus?: string,
  ): Prisma.OrderWhereInput {
    const searchCondition: Prisma.OrderWhereInput = cleanSearch
      ? {
          OR: [
            {
              currencyCode: {
                contains: cleanSearch,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            ...(Number.isInteger(Number(cleanSearch))
              ? [{ orderNumber: { equals: Number(cleanSearch) } }]
              : []),
            ...(Number.isFinite(Number(cleanSearch))
              ? [{ totalAmount: { equals: new Prisma.Decimal(cleanSearch) } }]
              : []),
          ],
        }
      : {};
    const statusValues = cleanStatus
      ? cleanStatus
          .split(',')
          .map((v) => v.trim().toLowerCase())
          .filter((v) => v.length > 0)
      : [];
    const matchedStatuses = Object.values(OrderStatus).filter((status) =>
      statusValues.includes(status.toLowerCase()),
    );
    const statusFilter =
      matchedStatuses.length > 0 ? { in: matchedStatuses } : undefined;
    const filters: Prisma.OrderWhereInput = {
      ...(statusFilter && { status: statusFilter }),
      ...(cleanFromDate && {
        createdAt: {
          gte: cleanFromDate,
        },
      }),

      ...(cleanToDate && {
        createdAt: {
          ...(cleanFromDate ? { gte: new Date(cleanFromDate) } : {}),
          lte: new Date(
            cleanToDate.setDate(new Date(cleanToDate).getDate() + 1),
          ),
        },
      }),
    };
    return {
      AND: [searchCondition, filters],
    };
  }
}
