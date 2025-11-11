import auditLogService from '@/utils/services/events';
import { entities } from '../../Events/utils';

export interface ActivityChanges {
  before: Record<string, any> | null;
  after: Record<string, any> | null;
}
type EntityKey = keyof typeof entities;

export interface IActivity {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
  changes: ActivityChanges;
}

export interface ActivityLogsProps {
  activities: IActivity[];
  entity: string;
}
export const gatActivityLogs = async (
  entity: EntityKey,
  contactId: string = '',
  setActivityData: (...args: any) => void,
) => {
  const activity = await auditLogService.getActivity(entities[entity], {
    entityId: contactId,
  });
  setActivityData(activity);
};
