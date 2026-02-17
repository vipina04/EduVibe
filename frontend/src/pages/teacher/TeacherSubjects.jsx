import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { HiAcademicCap, HiBookOpen, HiClipboardCheck } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

const TeacherSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getMySubjects();
      setSubjects(response.data || []);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      toast.error('Failed to load subjects');
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loading fullScreen />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Subjects
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your assigned subjects and classes
          </p>
        </div>

        {/* Subjects List */}
        {subjects.length === 0 ? (
          <Card className="p-12 text-center">
            <HiAcademicCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Subjects Assigned
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You haven't been assigned to teach any subjects yet. Contact admin to get subject assignments.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Card
                key={subject.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/teacher/subjects/${subject.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <HiBookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-sm rounded-full">
                    Active
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {subject.name}
                </h3>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>Classes Assigned:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {subject.assigned_classes?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Students:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {subject.total_students || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tests Created:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {subject.tests_count || 0}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/teacher/subjects/${subject.id}/chapters`);
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <HiClipboardCheck className="w-5 h-5" />
                    <span>View Chapters</span>
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherSubjects;















// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { teacherAPI } from '../../services/api';
// import DashboardLayout from '../../components/layout/DashboardLayout';
// import Card from '../../components/common/Card';
// import Loading from '../../components/common/Loading';
// import { HiAcademicCap, HiBookOpen, HiClipboardCheck } from 'react-icons/hi';
// import { toast } from 'react-hot-toast';

// const TeacherSubjects = () => {
//   const [subjects, setSubjects] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchSubjects();
//   }, []);

//   const fetchSubjects = async () => {
//     try {
//       setLoading(true);
//       const response = await teacherAPI.getSubjects();
//       setSubjects(response.data || []);
//     } catch (error) {
//       console.error('Failed to fetch subjects:', error);
//       toast.error('Failed to load subjects');
//       setSubjects([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <DashboardLayout>
//         <Loading fullScreen />
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout>
//       <div className="space-y-6">
//         {/* Header */}
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
//             My Subjects
//           </h1>
//           <p className="text-gray-600 dark:text-gray-400 mt-2">
//             Manage your assigned subjects and classes
//           </p>
//         </div>

//         {/* Subjects List */}
//         {subjects.length === 0 ? (
//           <Card className="p-12 text-center">
//             <HiAcademicCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
//               No Subjects Assigned
//             </h3>
//             <p className="text-gray-600 dark:text-gray-400">
//               You haven't been assigned to teach any subjects yet. Contact admin to get subject assignments.
//             </p>
//           </Card>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {subjects.map((subject) => (
//               <Card
//                 key={subject.id}
//                 className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
//                 onClick={() => navigate(`/teacher/subjects/${subject.id}`)}
//               >
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
//                     <HiBookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
//                   </div>
//                   <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-sm rounded-full">
//                     Active
//                   </span>
//                 </div>

//                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
//                   {subject.name}
//                 </h3>

//                 <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
//                   <div className="flex items-center justify-between">
//                     <span>Classes Assigned:</span>
//                     <span className="font-semibold text-gray-900 dark:text-white">
//                       {subject.assigned_classes?.length || 0}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span>Total Students:</span>
//                     <span className="font-semibold text-gray-900 dark:text-white">
//                       {subject.total_students || 0}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span>Tests Created:</span>
//                     <span className="font-semibold text-gray-900 dark:text-white">
//                       {subject.tests_count || 0}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       navigate(`/teacher/subjects/${subject.id}/chapters`);
//                     }}
//                     className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
//                   >
//                     <HiClipboardCheck className="w-5 h-5" />
//                     <span>View Chapters</span>
//                   </button>
//                 </div>
//               </Card>
//             ))}
//           </div>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// };

// export default TeacherSubjects;