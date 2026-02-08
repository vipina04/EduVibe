import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { teacherAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';

import {
  HiClipboardCheck,
  HiCalendar,
  HiAcademicCap,
} from 'react-icons/hi';

// ✅ FIX: HiBook does NOT exist
import { HiBookOpen } from 'react-icons/hi2';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    assigned_classes: 0,
    total_subjects: 0,
    total_tests: 0,
    recent_tests: []
  });

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const responses = await Promise.allSettled([
        teacherAPI.getDashboard?.(),
        teacherAPI.getSubjects?.(),
      ]);

      // Dashboard response
      if (responses[0].status === 'fulfilled') {
        setDashboardData(responses[0].value.data);
      }

      // Subjects response (404 safe)
      if (responses[1].status === 'fulfilled') {
        setSubjects(responses[1].value.data);
      } else {
        setSubjects([]); // 👈 prevent crash
      }

    } catch (error) {
      console.error('Teacher dashboard error:', error);
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

        {/* Welcome */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
          <h1 className="text-3xl font-bold">
            Welcome, {user?.first_name || 'Teacher'}!
          </h1>
          <p className="mt-2 text-indigo-100">
            Manage your classes and tests
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <Card>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm">Subjects</p>
                <p className="text-3xl font-bold">
                  {dashboardData.total_subjects || subjects.length}
                </p>
              </div>
              <HiBookOpen className="h-12 w-12" />
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm">Classes</p>
                <p className="text-3xl font-bold">
                  {dashboardData.assigned_classes || 0}
                </p>
              </div>
              <HiAcademicCap className="h-12 w-12" />
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm">Tests Created</p>
                <p className="text-3xl font-bold">
                  {dashboardData.total_tests || 0}
                </p>
              </div>
              <HiClipboardCheck className="h-12 w-12" />
            </div>
          </Card>

        </div>

        {/* Subjects */}
        <div>
          <h2 className="text-2xl font-bold mb-4">My Subjects</h2>

          {subjects.length === 0 ? (
            <Card>
              <p className="text-center text-gray-500 py-6">
                No subjects assigned yet.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map(subject => (
                <Card
                  key={subject.id}
                  className="cursor-pointer hover:shadow-lg"
                  onClick={() =>
                    navigate(`/teacher/subject/${subject.id}`)
                  }
                >
                  <h3 className="text-lg font-semibold">
                    {subject.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Class {subject.class_name}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;



























// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import { teacherAPI } from '../../services/api';
// import DashboardLayout from '../../components/layout/DashboardLayout';
// import Card from '../../components/common/Card';
// import Loading from '../../components/common/Loading';
// import { HiBookOpen, HiUserGroup, HiClipboardList, HiAcademicCap } from 'react-icons/hi';

// const TeacherDashboard = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [dashboardData, setDashboardData] = useState({
//     total_subjects: 0,
//     total_classes: 0,
//     total_students: 0,
//     pending_grading: 0,
//   });
//   const [subjects, setSubjects] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
      
//       const [dashResponse, subjectsResponse] = await Promise.all([
//         teacherAPI.getDashboard(),
//         teacherAPI.getSubjects(),
//       ]);

//       setDashboardData(dashResponse.data);
//       setSubjects(subjectsResponse.data);
//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <DashboardLayout>
//         <Loading />
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout>
//       <div className="space-y-6">
//         {/* Welcome Section */}
//         <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
//           <h1 className="text-3xl font-bold">Welcome, {user?.first_name}!</h1>
//           <p className="mt-2 text-blue-100">
//             Manage your classes and track student progress
//           </p>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-blue-600 dark:text-blue-400">Total Subjects</p>
//                 <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">
//                   {dashboardData.total_subjects}
//                 </p>
//               </div>
//               <HiBook className="h-12 w-12 text-blue-500" />
//             </div>
//           </Card>

//           <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-green-600 dark:text-green-400">Total Classes</p>
//                 <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">
//                   {dashboardData.total_classes}
//                 </p>
//               </div>
//               <HiAcademicCap className="h-12 w-12 text-green-500" />
//             </div>
//           </Card>

//           <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-purple-600 dark:text-purple-400">Total Students</p>
//                 <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">
//                   {dashboardData.total_students}
//                 </p>
//               </div>
//               <HiUserGroup className="h-12 w-12 text-purple-500" />
//             </div>
//           </Card>

//           <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-orange-600 dark:text-orange-400">Pending Grading</p>
//                 <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-2">
//                   {dashboardData.pending_grading}
//                 </p>
//               </div>
//               <HiClipboardList className="h-12 w-12 text-orange-500" />
//             </div>
//           </Card>
//         </div>

//         {/* Subjects Section */}
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
//             My Subjects
//           </h2>
          
//           {subjects.length === 0 ? (
//             <Card>
//               <p className="text-center text-gray-500 py-8">
//                 No subjects assigned yet.
//               </p>
//             </Card>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {subjects.map((subject) => (
//                 <Card
//                   key={subject.id}
//                   className="hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-slate-800"
//                   onClick={() => navigate(`/teacher/subject/${subject.id}/classes`)}
//                 >
//                   <div className="flex items-start justify-between mb-4">
//                     <div className="flex-1">
//                       <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                         {subject.name}
//                       </h3>
//                       <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                         {subject.description || 'No description'}
//                       </p>
//                     </div>
//                     <HiBook className="h-8 w-8 text-blue-500" />
//                   </div>

//                   <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
//                     <div className="flex justify-between">
//                       <span>Classes:</span>
//                       <span className="font-medium text-gray-900 dark:text-white">
//                         {subject.total_classes || 0}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>Students:</span>
//                       <span className="font-medium text-gray-900 dark:text-white">
//                         {subject.total_students || 0}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>Chapters:</span>
//                       <span className="font-medium text-gray-900 dark:text-white">
//                         {subject.total_chapters || 0}
//                       </span>
//                     </div>
//                   </div>

//                   <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
//                     <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
//                       Manage Classes
//                     </button>
//                   </div>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Quick Actions */}
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
//             Quick Actions
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <button
//               onClick={() => navigate('/teacher/attendance')}
//               className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow text-left"
//             >
//               <HiClipboardList className="h-8 w-8 text-green-500 mb-3" />
//               <h3 className="font-semibold text-gray-900 dark:text-white">Mark Attendance</h3>
//               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                 Take attendance for your classes
//               </p>
//             </button>

//             <button
//               onClick={() => navigate('/teacher/tests')}
//               className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow text-left"
//             >
//               <HiAcademicCap className="h-8 w-8 text-blue-500 mb-3" />
//               <h3 className="font-semibold text-gray-900 dark:text-white">Create Test</h3>
//               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                 Create and manage tests
//               </p>
//             </button>

//             <button
//               onClick={() => navigate('/teacher/doubts')}
//               className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow text-left"
//             >
//               <HiUserGroup className="h-8 w-8 text-purple-500 mb-3" />
//               <h3 className="font-semibold text-gray-900 dark:text-white">Student Doubts</h3>
//               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                 Answer student questions
//               </p>
//             </button>
//           </div>
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default TeacherDashboard;














// // import DashboardLayout from '../../components/layout/DashboardLayout';
// // export default function TeacherDashboard() {
// //   return (
// //     <DashboardLayout>
// //       <div className="p-6">
// //         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Dashboard - Coming Soon</h1>
// //       </div>
// //     </DashboardLayout>
// //   );
// // }