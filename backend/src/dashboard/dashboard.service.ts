import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {



    async getDashboard(user:{id:string,email:string,tenantId:string}){
        return{
            message:`Hello ${user.email} ${user.tenantId}`
        }
    }
}
