import DataTable from '@/features/components/Users/userslist';
import data from '@/features/components/Users/utils/user.json';

const Dashboard = () => {
  return (
    <>
      <div>
        <DataTable data={data} />
      </div>
    </>
  );
};
export default Dashboard;
