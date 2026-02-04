import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { HiClipboardCheck, HiCalendar, HiCurrencyRupee, HiAcademicCap } from 'react-icons/hi';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    enrolled_subjects: 0,
    completed_tests: 0,
    attendance_percentage: 0,
    pending_fees: 0,
    upcoming_tests: []
  });
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [dashResponse, subjectsResponse] = await Promise.all([
        studentAPI.getDashboard(),
        studentAPI.getSubjects(),
      ]);

      setDashboardData(dashResponse.data);
      setSubjects(subjectsResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loading />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl p-6 text-white">
          <h1 className="text-3xl font-bold">Welcome back, {user?.first_name}!</h1>
          <p className="mt-2 text-teal-100">
            Ready to continue your learning journey?
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Enrolled Subjects</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                  {dashboardData.enrolled_subjects}
                </p>
              </div>
              <HiBook className="h-12 w-12 text-blue-500" />
            </div>
          </Card>

          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Tests Completed</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">
                  {dashboardData.completed_tests}
                </p>
              </div>
              <HiClipboardCheck className="h-12 w-12 text-green-500" />
            </div>
          </Card>

          <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Attendance</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">
                  {dashboardData.attendance_percentage}%
                </p>
              </div>
              <HiCalendar className="h-12 w-12 text-purple-500" />
            </div>
          </Card>

          <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Pending Fees</p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-2">
                  ₹{dashboardData.pending_fees}
                </p>
              </div>
              <HiCurrencyRupee className="h-12 w-12 text-orange-500" />
            </div>
          </Card>
        </div>

        {/* Subjects Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            My Subjects
          </h2>
          
          {subjects.length === 0 ? (
            <Card>
              <p className="text-center text-gray-500 py-8">
                No subjects enrolled yet.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <Card
                  key={subject.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-slate-800"
                  onClick={() => navigate(`/student/subject/${subject.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {subject.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Class {subject.class_name}
                      </p>
                    </div>
                    <HiAcademicCap className="h-8 w-8 text-teal-500" />
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Teacher:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {subject.teacher_name || 'Not Assigned'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chapters:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {subject.total_chapters || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Progress:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {subject.progress || 0}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-teal-600 h-2 rounded-full transition-all"
                        style={{ width: `${subject.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Tests */}
        {dashboardData.upcoming_tests && dashboardData.upcoming_tests.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Upcoming Tests
            </h2>
            <Card className="bg-white dark:bg-slate-800">
              <div className="space-y-4">
                {dashboardData.upcoming_tests.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {test.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {test.subject} - {test.chapter}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(test.scheduled_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {test.duration} minutes
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
















// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { HiAcademicCap, HiClipboardList, HiCalendar } from 'react-icons/hi';
// import DashboardLayout from '../../components/layout/DashboardLayout';
// import Card from '../../components/common/Card';
// import Loading from '../../components/common/Loading';
// import { studentAPI } from '../../services/api';
// import toast from 'react-hot-toast';

// const StudentDashboard = () => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchDashboard();
//   }, []);

//   const fetchDashboard = async () => {
//     try {
//       const response = await studentAPI.getDashboard();
//       setData(response.data);
//     } catch (error) {
//       toast.error('Failed to load dashboard');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <Loading fullScreen />;

//   return (
//     <DashboardLayout>
//       <div className="p-6">
//         <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
//           Welcome, {data?.student?.full_name}!
//         </h1>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <Card glass>
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-gray-600 dark:text-gray-400 mb-1">Total Subjects</p>
//                 <p className="text-3xl font-bold text-blue-600">{data?.subjects?.length || 0}</p>
//               </div>
//               <HiAcademicCap className="w-12 h-12 text-blue-600 opacity-50" />
//             </div>
//           </Card>

//           <Card glass>
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-gray-600 dark:text-gray-400 mb-1">Tests Taken</p>
//                 <p className="text-3xl font-bold text-green-600">{data?.tests_taken || 0}</p>
//               </div>
//               <HiClipboardList className="w-12 h-12 text-green-600 opacity-50" />
//             </div>
//           </Card>

//           <Card glass>
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-gray-600 dark:text-gray-400 mb-1">Attendance</p>
//                 <p className="text-3xl font-bold text-purple-600">{data?.attendance_percentage || 0}%</p>
//               </div>
//               <HiCalendar className="w-12 h-12 text-purple-600 opacity-50" />
//             </div>
//           </Card>
//         </div>

//         {/* Subjects */}
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Subjects</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {data?.subjects?.map((subject) => (
//               <Link key={subject.id} to={`/student/subject/${subject.id}`}>
//                 <Card glass hover>
//                   <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
//                     {subject.name}
//                   </h3>
//                   <p className="text-gray-600 dark:text-gray-400 mb-4">
//                     {subject.chapters_count} Chapters
//                   </p>
//                   <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
//                     <span>Teacher: {subject.teacher_name}</span>
//                   </div>
//                 </Card>
//               </Link>
//             ))}
//           </div>
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default StudentDashboard;