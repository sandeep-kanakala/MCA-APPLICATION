import { passwordEncoder } from "@/common/password.encoder";
import { PrismaService } from "./prisma.service";
import { Injectable, OnModuleInit } from "@nestjs/common";

@Injectable()
export class ApplicationDataIntializer implements OnModuleInit {
    constructor(private readonly prismaService: PrismaService) { }
    async onModuleInit() {
        const tenantId = process.env.TENANT_ID;
        if (!tenantId) throw new Error('TENANT_ID not found in config');

        let tenant = await this.prismaService.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) {
            tenant = await this.prismaService.tenant.create({
                data: {
                    id: tenantId,
                    name: 'Multichoice',
                },
            });
        }

        const superUserEmail = process.env.SUPER_ADMIN_MAIL ?? "";
        const existingSuperUser = await this.prismaService.user.findUnique({
            where: {
                email_tenantId: { email: superUserEmail, tenantId },
            },
        });

        if (!existingSuperUser) {
            const hashedPassword = await passwordEncoder.hashPassword(process.env.DEFAULT_PASSWORD ?? "");
            await this.prismaService.user.create({
                data: {
                    email: superUserEmail,
                    password: hashedPassword,
                    firstName: '',
                    lastName: '',
                    phoneNo: "",
                    createdBy: "",
                    tenantId,
                },
            });
            console.log('Super user created');
        } else {
            console.log('Super user already exists');
        }
    }



}

