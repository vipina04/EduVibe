import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import { HiArrowLeft, HiBookOpen } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';

const TeacherAssignments = () => {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/teacher/dashboard">
            <Button variant="secondary" size="sm">
              <HiArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assignments</h1>
        </div>
        <Card className="bg-white dark:bg-gray-800 p-12 text-center">
          <HiBookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Coming Soon</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Assignment management will be available here</p>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeacherAssignments;





















// import DashboardLayout from '../../components/layout/DashboardLayout';
// export default function TeacherAssignments() {
//   return (
//     <DashboardLayout>
//       <div className="p-6">
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assignments - Coming Soon</h1>
//       </div>
//     </DashboardLayout>
//   );
// }