import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Order, OrderItem, Prisma } from '@prisma/client';

@Injectable()
export class OrderRespository {
  constructor(private readonly prismaService: PrismaService) {}

  async createOrder(
    data: Prisma.OrderCreateInput,
    select?: Prisma.OrderSelect,
  ): Promise<Order> {
    return this.prismaService.order.create({
      data,
      select,
    });
  }

  async getAllOrdersByAccountId(
    skip: number = 0,
    take: number = 10,
    sortField: string,
    order: string,
    include?: Prisma.OrderInclude,
    where?: Prisma.OrderWhereInput,
  ): Promise<Order[]> {
    return this.prismaService.order.findMany({
      where,
      skip,
      take,
      orderBy: { [sortField]: order },
      include,
    });
  }

  async countOrdersByAccountId(
    where?: Prisma.OrderWhereInput,
  ): Promise<number> {
    return this.prismaService.order.count({
      where,
    });
  }

  async findById(id: string): Promise<Order | OrderItem | null> {
    const order = await this.prismaService.order.findFirst({
      where: {
        id,
        isArchived: false,
      },
    });

    if (order) {
      return order;
    }

    return this.prismaService.orderItem.findFirst({
      where: {
        id,
      },
    });
  }

  async findOrderById(
    id: string,
    tenantId?: string,
    include?: Prisma.OrderInclude,
  ): Promise<Order | null> {
    return this.prismaService.order.findFirst({
      where: {
        id,
        tenantId,
        isArchived: false,
      },
      include,
    });
  }

  async updateOrderById(
    id: string,
    data: Prisma.OrderUpdateInput,
    select?: Prisma.OrderSelect,
  ): Promise<Order> {
    return this.prismaService.order.update({
      where: {
        id,
        isArchived: false,
      },
      data,
      select,
    });
  }

  async archiveOrderById(
    id: string,
    data: Prisma.OrderUpdateInput,
    select?: Prisma.OrderSelect,
  ): Promise<Order> {
    const deletedOrder: Order = await this.prismaService.order.update({
      where: { id, isArchived: false },
      data,
      select,
    });
    await this.prismaService.orderItem.deleteMany({
      where: {
        orderId: deletedOrder.id,
      },
    });
    return deletedOrder;
  }

  async addOrderItem(
    data: Prisma.OrderItemCreateInput,
    select?: Prisma.OrderItemSelect,
  ) {
    return this.prismaService.orderItem.create({
      data,
      select,
    });
  }

  async findOrderItemById(
    id: string,
    select?: Prisma.OrderSelect,
  ): Promise<OrderItem | null> {
    return this.prismaService.orderItem.findFirst({
      where: {
        id,
      },
      select,
    });
  }
  async updateOrderItemById(
    itemId: string,
    data: Prisma.OrderItemUpdateInput,
    select?: Prisma.OrderItemSelect,
  ): Promise<OrderItem | null> {
    return this.prismaService.orderItem.update({
      where: { id: itemId },
      data,
      select,
    });
  }
  async removeOrderItemById(itemId: string): Promise<OrderItem | null> {
    return this.prismaService.orderItem.delete({
      where: {
        id: itemId,
      },
    });
  }

  async getAllOrderItemsByOrderId(orderId: string): Promise<OrderItem[]> {
    return this.prismaService.orderItem.findMany({
      where: {
        orderId: orderId,
      },
    });
  }

  async createOrderItems(
    createInputs: Prisma.OrderItemCreateInput[],
  ): Promise<OrderItem[]> {
    const createdItems = this.prismaService.$transaction(
      createInputs.map((input) =>
        this.prismaService.orderItem.create({ data: input }),
      ),
    );
    return createdItems;
  }

  async replaceOrderItem(
    newItemInput: Prisma.OrderItemCreateInput,
    existingOrderItemId: string,
  ): Promise<[OrderItem, OrderItem]> {
    return this.prismaService.$transaction([
      this.prismaService.orderItem.create({ data: newItemInput }),
      this.prismaService.orderItem.delete({
        where: { id: existingOrderItemId },
      }),
    ]);
  }
}
