import fetchApiClient from '@/utils/fetchApiClient';
import type { AuditLogResponse, AuditLogData, EventLogItem } from '@/types/index';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { entities } from '@/features/components/Events/utils';

const createDataDescription = (log: AuditLogData): string => {
  const { action, entity, details } = log;
  const userEmail = details.user.email;

  const entityName = entity.toLowerCase();

  if (action === 'CREATE' && entityName === entities.account.toLowerCase() && details.after) {
    const { name } = details.after;
    return `New ${entities.account.toLowerCase()}: ${name} by ${userEmail}`;
  }

  if (action === 'CREATE' && entityName === entities.contact.toLowerCase() && details.after) {
    const { firstName, lastName, email } = details.after;
    return `New ${entities.contact.toLowerCase()}: ${firstName} ${lastName}, ${email} by ${userEmail}`;
  }

  if (action === 'UPDATE' && entityName === entities.account.toLowerCase() && details.body) {
    const updatedFields = Object.keys(details.body).join(', ');
    const accountName = details.after?.name || details.body.name || log.entityId;

    if (details.response && details.response.message === 'no changes found') {
      return `Attempted update on ${entities.account.toLowerCase()} (${accountName}) by ${userEmail}: No changes made.`;
    }

    return `Updated ${entities.account.toLowerCase()} (${accountName}): ${updatedFields} by ${userEmail}`;
  }

  return `${action} on ${entity} by ${userEmail}`;
};

const auditLogService = {
  async getPaginated(params: { limit: number; page: number }): Promise<{
    logs: EventLogItem[];
    rawLogs: AuditLogData[];
    total: number;
    totalPages: number;
  }> {
    try {
      const response: AuditLogResponse = await fetchApiClient.get('/audit-logs', params);
      const apiData = response.data;

      if (!apiData || !apiData.data) {
        return { logs: [], rawLogs: [], total: 0, totalPages: 0 };
      }

      const rawLogs: AuditLogData[] = apiData.data;

      const transformedLogs: EventLogItem[] = rawLogs.map((log: AuditLogData) => ({
        id: log.id,
        event: `${log.action.toLowerCase()}`,
        data: createDataDescription(log),
        account: `${log.entity}`,
        createdBy: log.details.user.email,
        createdAt: formatDistanceToNow(parseISO(log.createdAt), { addSuffix: true }),
      }));

      return {
        logs: transformedLogs,
        rawLogs: rawLogs,
        total: apiData.total,
        totalPages: apiData.totalPages,
      };
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return { logs: [], rawLogs: [], total: 0, totalPages: 0 };
    }
  },

  async getActivity(entity: string, params: { entityId?: string }) {
    try {
      const response = await fetchApiClient.get(`/audit-logs/${entity}`, params);
      return response.data?.data || response.data;
    } catch (error) {
      console.error(`Error fetching activities of : ${entity}`, error);
      throw error;
    }
  },
};

export default auditLogService;
