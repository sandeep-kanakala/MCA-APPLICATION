// import type { Account, Prisma } from '@prisma/client';
// import type {
//   CreateAccountDto,
//   UpdateAccountDto,
// } from '@/modules/account/dto/account.dto';

// // request to prisma create
// export const toPrismaCreateAccountData = (
//   dto: CreateAccountDto,
//   decoded: { tenantId: string; id: string },
// ): Prisma.AccountCreateInput => ({
//   tenant: { connect: { id: decoded.tenantId } },
//   name: dto.name.trim(),
//   type: dto.type ?? null,
//   industry: dto.industry ?? null,
//   website: dto.website ?? null,
//   phone: dto.phone ?? null,
//   billingStreet: dto.billingStreet ?? null,
//   billingCity: dto.billingCity ?? null,
//   billingState: dto.billingState ?? null,
//   billingPostal: dto.billingPostal ?? null,
//   billingCountry: dto.billingCountry ?? null,
//   shippingStreet: dto.shippingStreet ?? null,
//   shippingCity: dto.shippingCity ?? null,
//   shippingState: dto.shippingState ?? null,
//   shippingPostal: dto.shippingPostal ?? null,
//   shippingCountry: dto.shippingCountry ?? null,
//   owner: { connect: { id: decoded.id } },
//   createdBy: { connect: { id: decoded.id } },
//   updatedBy: { connect: { id: decoded.id } },
// });

// // request to prisma update
// export const toPrismaUpdateAccountData = (
//   dto: Partial<UpdateAccountDto>,
//   userId: string,
// ): Prisma.AccountUpdateInput => ({
//   ...dto,
//   updatedBy: { connect: { id: userId } },
//   updatedAt: new Date(),
// });

// // prisma to response
// export const toAccountResponseDto = (account: Account) => ({
//   id: account.id,
//   name: account.name,
//   type: account.type,
//   industry: account.industry,
//   website: account.website,
//   phone: account.phone,

//   billingAddress: {
//     street: account.billingStreet,
//     city: account.billingCity,
//     state: account.billingState,
//     postal: account.billingPostal,
//     country: account.billingCountry,
//   },
//   shippingAddress: {
//     street: account.shippingStreet,
//     city: account.shippingCity,
//     state: account.shippingState,
//     postal: account.shippingPostal,
//     country: account.shippingCountry,
//   },

//   ownerId: account?.ownerId,
//   createdAt: account.createdAt,
//   updatedAt: account.updatedAt,
// });
