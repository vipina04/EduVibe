import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiArrowLeft, 
  HiClipboardList, 
  HiClock, 
  HiCheckCircle,
  HiXCircle,
  HiChartBar 
} from 'react-icons/hi';
// Added HiTrophy from hi2 to fix the "requested module does not provide an export" error
import { HiTrophy } from 'react-icons/hi2'; 
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { studentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const MyTests = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, passed, failed

  useEffect(() => {
    fetchMyAttempts();
  }, []);

  const fetchMyAttempts = async () => {
    try {
      const response = await studentAPI.getMyAttempts();
      setAttempts(response.data || []);
    } catch (error) {
      console.error('Failed to load test attempts:', error);
      toast.error('Failed to load your tests');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading fullScreen />;

  const filteredAttempts = attempts.filter(attempt => {
    if (filter === 'all') return true;
    const percentage = (attempt.score / attempt.test.marks) * 100;
    if (filter === 'passed') return percentage >= 40;
    if (filter === 'failed') return percentage < 40;
    return true;
  });

  const stats = {
    total: attempts.length,
    passed: attempts.filter(a => (a.score / a.test.marks) * 100 >= 40).length,
    failed: attempts.filter(a => (a.score / a.test.marks) * 100 < 40).length,
    average: attempts.length > 0 
      ? (attempts.reduce((sum, a) => sum + (a.score / a.test.marks) * 100, 0) / attempts.length).toFixed(1)
      : 0
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/student/dashboard">
              <Button variant="secondary" size="sm">
                <HiArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Tests
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                View all your test attempts and results
              </p>
            </div>
          </div>
          {/* Trophy Icon added here as a visual milestone if user has passed tests */}
          {stats.passed > 0 && (
            <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <HiTrophy className="w-6 h-6 text-yellow-600 mr-2" />
              <span className="font-bold text-yellow-700 dark:text-yellow-500">{stats.passed} Passed!</span>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 mb-1">Total Tests</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <HiClipboardList className="w-10 h-10 opacity-80" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 mb-1">Passed</p>
                <p className="text-3xl font-bold">{stats.passed}</p>
              </div>
              <HiCheckCircle className="w-10 h-10 opacity-80" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 mb-1">Failed</p>
                <p className="text-3xl font-bold">{stats.failed}</p>
              </div>
              <HiXCircle className="w-10 h-10 opacity-80" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 mb-1">Average Score</p>
                <p className="text-3xl font-bold">{stats.average}%</p>
              </div>
              <HiChartBar className="w-10 h-10 opacity-80" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 mb-6">
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All Tests ({attempts.length})
          </Button>
          <Button
            variant={filter === 'passed' ? 'primary' : 'secondary'}
            onClick={() => setFilter('passed')}
            size="sm"
          >
            Passed ({stats.passed})
          </Button>
          <Button
            variant={filter === 'failed' ? 'primary' : 'secondary'}
            onClick={() => setFilter('failed')}
            size="sm"
          >
            Failed ({stats.failed})
          </Button>
        </div>

        {/* Test Attempts List */}
        {filteredAttempts.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 p-12 text-center">
            <HiClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {filter === 'all' ? 'No Tests Taken Yet' : `No ${filter} tests`}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filter === 'all' 
                ? "You haven't taken any tests yet. Check available tests in your subjects."
                : `You don't have any ${filter} tests.`}
            </p>
            <Link to="/student/dashboard">
              <Button variant="primary">
                Browse Subjects
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAttempts.map((attempt) => {
              const percentage = ((attempt.score / attempt.test.marks) * 100).toFixed(1);
              const isPassed = percentage >= 40;

              return (
                <Card 
                  key={attempt.id}
                  className="bg-white dark:bg-gray-800 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between p-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {attempt.test.name || 'Test'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          isPassed 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                        }`}>
                          {isPassed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {attempt.test.type || 'MCQ'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {attempt.score} / {attempt.test.marks}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Percentage</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {percentage}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Attempted On</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {new Date(attempt.attempted_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isPassed ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 flex flex-col space-y-2">
                      <Link to={`/student/test-attempt/${attempt.id}/result`}>
                        <Button variant="primary" size="sm">
                          View Result & Solutions
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyTests;































// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { 
//   HiArrowLeft, 
//   HiClipboardList, 
//   HiClock, 
//   HiCheckCircle,
//   HiXCircle,
//   HiChartBar 
// } from 'react-icons/hi';
// import DashboardLayout from '../../components/layout/DashboardLayout';
// import Card from '../../components/common/Card';
// import Loading from '../../components/common/Loading';
// import Button from '../../components/common/Button';
// import { studentAPI } from '../../services/api';
// import toast from 'react-hot-toast';


// const MyTests = () => {
//   const [attempts, setAttempts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState('all'); // all, passed, failed

//   useEffect(() => {
//     fetchMyAttempts();
//   }, []);

//   const fetchMyAttempts = async () => {
//     try {
//       const response = await studentAPI.getMyAttempts();
//       setAttempts(response.data || []);
//     } catch (error) {
//       console.error('Failed to load test attempts:', error);
//       toast.error('Failed to load your tests');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <Loading fullScreen />;

//   const filteredAttempts = attempts.filter(attempt => {
//     if (filter === 'all') return true;
//     const percentage = (attempt.score / attempt.test.marks) * 100;
//     if (filter === 'passed') return percentage >= 40;
//     if (filter === 'failed') return percentage < 40;
//     return true;
//   });

//   const stats = {
//     total: attempts.length,
//     passed: attempts.filter(a => (a.score / a.test.marks) * 100 >= 40).length,
//     failed: attempts.filter(a => (a.score / a.test.marks) * 100 < 40).length,
//     average: attempts.length > 0 
//       ? (attempts.reduce((sum, a) => sum + (a.score / a.test.marks) * 100, 0) / attempts.length).toFixed(1)
//       : 0
//   };

//   return (
//     <DashboardLayout>
//       <div className="p-6 max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <div className="flex items-center space-x-4">
//             <Link to="/student/dashboard">
//               <Button variant="secondary" size="sm">
//                 <HiArrowLeft className="w-4 h-4 mr-2" />
//                 Back
//               </Button>
//             </Link>
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
//                 My Tests
//               </h1>
//               <p className="text-gray-600 dark:text-gray-400 mt-1">
//                 View all your test attempts and results
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-blue-100 mb-1">Total Tests</p>
//                 <p className="text-3xl font-bold">{stats.total}</p>
//               </div>
//               <HiClipboardList className="w-10 h-10 opacity-80" />
//             </div>
//           </Card>

//           <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-green-100 mb-1">Passed</p>
//                 <p className="text-3xl font-bold">{stats.passed}</p>
//               </div>
//               <HiCheckCircle className="w-10 h-10 opacity-80" />
//             </div>
//           </Card>

//           <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-red-100 mb-1">Failed</p>
//                 <p className="text-3xl font-bold">{stats.failed}</p>
//               </div>
//               <HiXCircle className="w-10 h-10 opacity-80" />
//             </div>
//           </Card>

//           <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-purple-100 mb-1">Average Score</p>
//                 <p className="text-3xl font-bold">{stats.average}%</p>
//               </div>
//               <HiChartBar className="w-10 h-10 opacity-80" />
//             </div>
//           </Card>
//         </div>

//         {/* Filters */}
//         <div className="flex space-x-4 mb-6">
//           <Button
//             variant={filter === 'all' ? 'primary' : 'secondary'}
//             onClick={() => setFilter('all')}
//             size="sm"
//           >
//             All Tests ({attempts.length})
//           </Button>
//           <Button
//             variant={filter === 'passed' ? 'primary' : 'secondary'}
//             onClick={() => setFilter('passed')}
//             size="sm"
//           >
//             Passed ({stats.passed})
//           </Button>
//           <Button
//             variant={filter === 'failed' ? 'primary' : 'secondary'}
//             onClick={() => setFilter('failed')}
//             size="sm"
//           >
//             Failed ({stats.failed})
//           </Button>
//         </div>

//         {/* Test Attempts List */}
//         {filteredAttempts.length === 0 ? (
//           <Card className="bg-white dark:bg-gray-800 p-12 text-center">
//             <HiClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
//               {filter === 'all' ? 'No Tests Taken Yet' : `No ${filter} tests`}
//             </h3>
//             <p className="text-gray-600 dark:text-gray-400 mb-6">
//               {filter === 'all' 
//                 ? "You haven't taken any tests yet. Check available tests in your subjects."
//                 : `You don't have any ${filter} tests.`}
//             </p>
//             <Link to="/student/dashboard">
//               <Button variant="primary">
//                 Browse Subjects
//               </Button>
//             </Link>
//           </Card>
//         ) : (
//           <div className="space-y-4">
//             {filteredAttempts.map((attempt) => {
//               const percentage = ((attempt.score / attempt.test.marks) * 100).toFixed(1);
//               const isPassed = percentage >= 40;

//               return (
//                 <Card 
//                   key={attempt.id}
//                   className="bg-white dark:bg-gray-800 hover:shadow-xl transition-all"
//                 >
//                   <div className="flex items-center justify-between p-6">
//                     <div className="flex-1">
//                       <div className="flex items-center space-x-3 mb-2">
//                         <h3 className="text-lg font-bold text-gray-900 dark:text-white">
//                           {attempt.test.name || 'Test'}
//                         </h3>
//                         <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                           isPassed 
//                             ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
//                             : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
//                         }`}>
//                           {isPassed ? 'Passed' : 'Failed'}
//                         </span>
//                       </div>
                      
//                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
//                         <div>
//                           <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
//                           <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
//                             {attempt.test.type || 'MCQ'}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
//                           <p className="text-sm font-medium text-gray-900 dark:text-white">
//                             {attempt.score} / {attempt.test.marks}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-xs text-gray-500 dark:text-gray-400">Percentage</p>
//                           <p className="text-sm font-medium text-gray-900 dark:text-white">
//                             {percentage}%
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-xs text-gray-500 dark:text-gray-400">Attempted On</p>
//                           <p className="text-sm font-medium text-gray-900 dark:text-white">
//                             {new Date(attempt.attempted_at).toLocaleDateString()}
//                           </p>
//                         </div>
//                       </div>

//                       {/* Progress Bar */}
//                       <div className="mt-4">
//                         <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//                           <div
//                             className={`h-2 rounded-full transition-all ${
//                               isPassed ? 'bg-green-500' : 'bg-red-500'
//                             }`}
//                             style={{ width: `${percentage}%` }}
//                           ></div>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="ml-6 flex flex-col space-y-2">
//                       <Link to={`/student/test-attempt/${attempt.id}/result`}>
//                         <Button variant="primary" size="sm">
//                           View Result & Solutions
//                         </Button>
//                       </Link>
//                     </div>
//                   </div>
//                 </Card>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// };

// export default MyTests;


















// // import DashboardLayout from '../../components/layout/DashboardLayout';
// // export default function MyTests() {
// //   return (
// //     <DashboardLayout>
// //       <div className="p-6">
// //         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Tests - Coming Soon</h1>
// //       </div>
// //     </DashboardLayout>
// //   );
// // }