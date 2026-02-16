import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import { studentAPI } from '../../services/api';
import { HiCalendar, HiClock, HiCheckCircle, HiXCircle } from 'react-icons/hi';

const MyAttendance = () => {
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, [selectedSubject, startDate, endDate]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedSubject !== 'all') params.subject_id = selectedSubject;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
    
      const response = await studentAPI.getMyAttendance(params);
      console.log('🔍 Full Response:', response.data);
      console.log('📚 Subjects:', response.data.subjects);
      console.log('📊 Records:', response.data.records);
      setAttendanceData(response.data);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 75) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading attendance...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Attendance
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View your attendance records and statistics
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Filters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Subject Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">All Subjects</option>
                  {attendanceData?.subjects?.map((subject, idx) => (
                    <option key={subject.id || `subject-${idx}`} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Classes</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {attendanceData?.overall_stats?.total_classes || 0}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Present</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {attendanceData?.overall_stats?.present || 0}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Absent</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {attendanceData?.overall_stats?.absent || 0}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Percentage</p>
            <p className={`text-2xl font-bold ${getStatusColor(attendanceData?.overall_stats?.percentage || 0)}`}>
              {attendanceData?.overall_stats?.percentage?.toFixed(2) || 0}%
            </p>
          </Card>
        </div>

        {/* Subject-wise Statistics */}
        <Card className="mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Subject-wise Attendance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {attendanceData?.subjects?.map((subject, idx) => (
                <div
                  key={subject.id || `subject-card-${idx}`}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {subject.name}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {subject.total_classes}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Present:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {subject.present}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Absent:</span>
                      <span className="font-medium text-red-600 dark:text-red-400">
                        {subject.absent}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Percentage:</span>
                      <span className={`font-bold ${getStatusColor(subject.percentage)}`}>
                        {subject.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Attendance Records Table */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Attendance Records
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Teacher
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {attendanceData?.records?.map((record, index) => (
                    <tr key={record.id || `record-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <HiCalendar className="w-4 h-4 text-gray-400" />
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {record.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {record.teacher_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {record.from_time && record.to_time ? (
                          <div className="flex items-center gap-1">
                            <HiClock className="w-4 h-4" />
                            {record.from_time} - {record.to_time}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <HiClock className="w-4 h-4" />
                            {record.time}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDuration(record.duration_minutes)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {record.is_present ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <HiCheckCircle className="w-4 h-4" />
                            Present
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            <HiXCircle className="w-4 h-4" />
                            Absent
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {attendanceData?.records?.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No attendance records found
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MyAttendance;






































// import { useState, useEffect } from 'react';
// import { toast } from 'react-hot-toast';
// import DashboardLayout from '../../components/layout/DashboardLayout';
// import Card from '../../components/common/Card';
// import { studentAPI } from '../../services/api';
// import { HiCalendar, HiClock, HiCheckCircle, HiXCircle } from 'react-icons/hi';

// const MyAttendance = () => {
//   const [loading, setLoading] = useState(true);
//   const [attendanceData, setAttendanceData] = useState(null);
//   const [selectedSubject, setSelectedSubject] = useState('all');
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');

//   useEffect(() => {
//     fetchAttendance();
//   }, [selectedSubject, startDate, endDate]);

//   const fetchAttendance = async () => {
//     try {
//       setLoading(true);
//       const params = {};
//       if (selectedSubject !== 'all') params.subject_id = selectedSubject;
//       if (startDate) params.start_date = startDate;
//       if (endDate) params.end_date = endDate;

//       const response = await studentAPI.getMyAttendance(params);
//       setAttendanceData(response.data);
//     } catch (error) {
//       console.error('Failed to fetch attendance:', error);
//       toast.error('Failed to load attendance');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusColor = (percentage) => {
//     if (percentage >= 75) return 'text-green-600 dark:text-green-400';
//     if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
//     return 'text-red-600 dark:text-red-400';
//   };

//   const formatDuration = (minutes) => {
//     if (!minutes) return 'N/A';
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     if (hours === 0) return `${mins} min`;
//     if (mins === 0) return `${hours} hr`;
//     return `${hours} hr ${mins} min`;
//   };

//   if (loading) {
//     return (
//       <DashboardLayout>
//         <div className="flex items-center justify-center min-h-screen">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//             <p className="mt-4 text-gray-600 dark:text-gray-400">Loading attendance...</p>
//           </div>
//         </div>
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout>
//       <div className="p-6 max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
//             My Attendance
//           </h1>
//           <p className="text-gray-600 dark:text-gray-400 mt-2">
//             View your attendance records and statistics
//           </p>
//         </div>

//         {/* Filters */}
//         <Card className="mb-6">
//           <div className="p-6">
//             <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
//               Filters
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               {/* Subject Filter */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                   Subject
//                 </label>
//                 <select
//                   value={selectedSubject}
//                   onChange={(e) => setSelectedSubject(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
//                 >
//                   <option value="all">All Subjects</option>
//                   {attendanceData?.subjects?.map(subject => (
//                     <option key={subject.id} value={subject.id}>
//                       {subject.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Start Date */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                   From Date
//                 </label>
//                 <input
//                   type="date"
//                   value={startDate}
//                   onChange={(e) => setStartDate(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
//                 />
//               </div>

//               {/* End Date */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                   To Date
//                 </label>
//                 <input
//                   type="date"
//                   value={endDate}
//                   onChange={(e) => setEndDate(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
//                 />
//               </div>
//             </div>
//           </div>
//         </Card>

//         {/* Overall Statistics */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//           <Card className="p-4">
//             <p className="text-sm text-gray-500 dark:text-gray-400">Total Classes</p>
//             <p className="text-2xl font-bold text-gray-900 dark:text-white">
//               {attendanceData?.overall_stats?.total_classes || 0}
//             </p>
//           </Card>
//           <Card className="p-4">
//             <p className="text-sm text-gray-500 dark:text-gray-400">Present</p>
//             <p className="text-2xl font-bold text-green-600 dark:text-green-400">
//               {attendanceData?.overall_stats?.present || 0}
//             </p>
//           </Card>
//           <Card className="p-4">
//             <p className="text-sm text-gray-500 dark:text-gray-400">Absent</p>
//             <p className="text-2xl font-bold text-red-600 dark:text-red-400">
//               {attendanceData?.overall_stats?.absent || 0}
//             </p>
//           </Card>
//           <Card className="p-4">
//             <p className="text-sm text-gray-500 dark:text-gray-400">Percentage</p>
//             <p className={`text-2xl font-bold ${getStatusColor(attendanceData?.overall_stats?.percentage || 0)}`}>
//               {attendanceData?.overall_stats?.percentage?.toFixed(2) || 0}%
//             </p>
//           </Card>
//         </div>

//         {/* Subject-wise Statistics */}
//         <Card className="mb-6">
//           <div className="p-6">
//             <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
//               Subject-wise Attendance
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {attendanceData?.subjects?.map(subject => (
//                 <div
//                   key={subject.id}
//                   className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
//                 >
//                   <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
//                     {subject.name}
//                   </h4>
//                   <div className="space-y-1 text-sm">
//                     <div className="flex justify-between">
//                       <span className="text-gray-600 dark:text-gray-400">Total:</span>
//                       <span className="font-medium text-gray-900 dark:text-white">
//                         {subject.total_classes}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600 dark:text-gray-400">Present:</span>
//                       <span className="font-medium text-green-600 dark:text-green-400">
//                         {subject.present}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600 dark:text-gray-400">Absent:</span>
//                       <span className="font-medium text-red-600 dark:text-red-400">
//                         {subject.absent}
//                       </span>
//                     </div>
//                     <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
//                       <span className="text-gray-600 dark:text-gray-400">Percentage:</span>
//                       <span className={`font-bold ${getStatusColor(subject.percentage)}`}>
//                         {subject.percentage}%
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </Card>

//         {/* Attendance Records Table */}
//         <Card>
//           <div className="p-6">
//             <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
//               Attendance Records
//             </h3>
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50 dark:bg-gray-700">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                       Date
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                       Subject
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                       Teacher
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                       Time
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                       Duration
//                     </th>
//                     <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                       Status
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
//                   {attendanceData?.records?.map(record => (
//                     <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
//                         <div className="flex items-center gap-2">
//                           <HiCalendar className="w-4 h-4 text-gray-400" />
//                           {new Date(record.date).toLocaleDateString()}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
//                         {record.subject}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
//                         {record.teacher_name}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
//                         {record.from_time && record.to_time ? (
//                           <div className="flex items-center gap-1">
//                             <HiClock className="w-4 h-4" />
//                             {record.from_time} - {record.to_time}
//                           </div>
//                         ) : (
//                           <div className="flex items-center gap-1">
//                             <HiClock className="w-4 h-4" />
//                             {record.time}
//                           </div>
//                         )}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
//                         {formatDuration(record.duration_minutes)}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-center">
//                         {record.is_present ? (
//                           <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
//                             <HiCheckCircle className="w-4 h-4" />
//                             Present
//                           </span>
//                         ) : (
//                           <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
//                             <HiXCircle className="w-4 h-4" />
//                             Absent
//                           </span>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
              
//               {attendanceData?.records?.length === 0 && (
//                 <div className="text-center py-8 text-gray-500 dark:text-gray-400">
//                   No attendance records found
//                 </div>
//               )}
//             </div>
//           </div>
//         </Card>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default MyAttendance;




































// // import { useState, useEffect } from 'react';
// // import { toast } from 'react-hot-toast';
// // import DashboardLayout from '../../components/layout/DashboardLayout';
// // import Card from '../../components/common/Card';
// // import { studentAPI } from '../../services/api';
// // import { HiCalendar, HiClock, HiCheckCircle, HiXCircle } from 'react-icons/hi';

// // const MyAttendance = () => {
// //   const [loading, setLoading] = useState(true);
// //   const [attendanceData, setAttendanceData] = useState(null);
// //   const [selectedSubject, setSelectedSubject] = useState('all');
// //   const [startDate, setStartDate] = useState('');
// //   const [endDate, setEndDate] = useState('');

// //   useEffect(() => {
// //     fetchAttendance();
// //   }, [selectedSubject, startDate, endDate]);

// //   const fetchAttendance = async () => {
// //     try {
// //       setLoading(true);
// //       const params = {};
// //       if (selectedSubject !== 'all') params.subject_id = selectedSubject;
// //       if (startDate) params.start_date = startDate;
// //       if (endDate) params.end_date = endDate;

// //       const response = await studentAPI.getMyAttendance(params);
// //       setAttendanceData(response.data);
// //     } catch (error) {
// //       console.error('Failed to fetch attendance:', error);
// //       toast.error('Failed to load attendance');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const getStatusColor = (percentage) => {
// //     if (percentage >= 75) return 'text-green-600 dark:text-green-400';
// //     if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
// //     return 'text-red-600 dark:text-red-400';
// //   };

// //   const formatDuration = (minutes) => {
// //     if (!minutes) return 'N/A';
// //     const hours = Math.floor(minutes / 60);
// //     const mins = minutes % 60;
// //     if (hours === 0) return `${mins} min`;
// //     if (mins === 0) return `${hours} hr`;
// //     return `${hours} hr ${mins} min`;
// //   };

// //   if (loading) {
// //     return (
// //       <DashboardLayout>
// //         <div className="flex items-center justify-center min-h-screen">
// //           <div className="text-center">
// //             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
// //             <p className="mt-4 text-gray-600 dark:text-gray-400">Loading attendance...</p>
// //           </div>
// //         </div>
// //       </DashboardLayout>
// //     );
// //   }

// //   return (
// //     <DashboardLayout>
// //       <div className="p-6 max-w-7xl mx-auto">
// //         {/* Header */}
// //         <div className="mb-6">
// //           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
// //             My Attendance
// //           </h1>
// //           <p className="text-gray-600 dark:text-gray-400 mt-2">
// //             View your attendance records and statistics
// //           </p>
// //         </div>

// //         {/* Filters */}
// //         <Card className="mb-6">
// //           <div className="p-6">
// //             <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
// //               Filters
// //             </h3>
// //             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //               {/* Subject Filter */}
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                   Subject
// //                 </label>
// //                 <select
// //                   value={selectedSubject}
// //                   onChange={(e) => setSelectedSubject(e.target.value)}
// //                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
// //                 >
// //                   <option value="all">All Subjects</option>
// //                   {attendanceData?.subjects?.map(subject => (
// //                     <option key={subject.id} value={subject.id}>
// //                       {subject.name}
// //                     </option>
// //                   ))}
// //                 </select>
// //               </div>

// //               {/* Start Date */}
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                   From Date
// //                 </label>
// //                 <input
// //                   type="date"
// //                   value={startDate}
// //                   onChange={(e) => setStartDate(e.target.value)}
// //                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
// //                 />
// //               </div>

// //               {/* End Date */}
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                   To Date
// //                 </label>
// //                 <input
// //                   type="date"
// //                   value={endDate}
// //                   onChange={(e) => setEndDate(e.target.value)}
// //                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
// //                 />
// //               </div>
// //             </div>
// //           </div>
// //         </Card>

// //         {/* Overall Statistics */}
// //         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
// //           <Card className="p-4">
// //             <p className="text-sm text-gray-500 dark:text-gray-400">Total Classes</p>
// //             <p className="text-2xl font-bold text-gray-900 dark:text-white">
// //               {attendanceData?.overall_stats?.total_classes || 0}
// //             </p>
// //           </Card>
// //           <Card className="p-4">
// //             <p className="text-sm text-gray-500 dark:text-gray-400">Present</p>
// //             <p className="text-2xl font-bold text-green-600 dark:text-green-400">
// //               {attendanceData?.overall_stats?.present || 0}
// //             </p>
// //           </Card>
// //           <Card className="p-4">
// //             <p className="text-sm text-gray-500 dark:text-gray-400">Absent</p>
// //             <p className="text-2xl font-bold text-red-600 dark:text-red-400">
// //               {attendanceData?.overall_stats?.absent || 0}
// //             </p>
// //           </Card>
// //           <Card className="p-4">
// //             <p className="text-sm text-gray-500 dark:text-gray-400">Percentage</p>
// //             <p className={`text-2xl font-bold ${getStatusColor(attendanceData?.overall_stats?.percentage || 0)}`}>
// //               {attendanceData?.overall_stats?.percentage?.toFixed(2) || 0}%
// //             </p>
// //           </Card>
// //         </div>

// //         {/* Subject-wise Statistics */}
// //         <Card className="mb-6">
// //           <div className="p-6">
// //             <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
// //               Subject-wise Attendance
// //             </h3>
// //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
// //               {attendanceData?.subjects?.map(subject => (
// //                 <div
// //                   key={subject.id}
// //                   className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
// //                 >
// //                   <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
// //                     {subject.name}
// //                   </h4>
// //                   <div className="space-y-1 text-sm">
// //                     <div className="flex justify-between">
// //                       <span className="text-gray-600 dark:text-gray-400">Total:</span>
// //                       <span className="font-medium text-gray-900 dark:text-white">
// //                         {subject.total_classes}
// //                       </span>
// //                     </div>
// //                     <div className="flex justify-between">
// //                       <span className="text-gray-600 dark:text-gray-400">Present:</span>
// //                       <span className="font-medium text-green-600 dark:text-green-400">
// //                         {subject.present}
// //                       </span>
// //                     </div>
// //                     <div className="flex justify-between">
// //                       <span className="text-gray-600 dark:text-gray-400">Absent:</span>
// //                       <span className="font-medium text-red-600 dark:text-red-400">
// //                         {subject.absent}
// //                       </span>
// //                     </div>
// //                     <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
// //                       <span className="text-gray-600 dark:text-gray-400">Percentage:</span>
// //                       <span className={`font-bold ${getStatusColor(subject.percentage)}`}>
// //                         {subject.percentage}%
// //                       </span>
// //                     </div>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
// //         </Card>

// //         {/* Attendance Records Table */}
// //         <Card>
// //           <div className="p-6">
// //             <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
// //               Attendance Records
// //             </h3>
// //             <div className="overflow-x-auto">
// //               <table className="w-full">
// //                 <thead className="bg-gray-50 dark:bg-gray-700">
// //                   <tr>
// //                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
// //                       Date
// //                     </th>
// //                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
// //                       Subject
// //                     </th>
// //                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
// //                       Teacher
// //                     </th>
// //                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
// //                       Time
// //                     </th>
// //                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
// //                       Duration
// //                     </th>
// //                     <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
// //                       Status
// //                     </th>
// //                   </tr>
// //                 </thead>
// //                 <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
// //                   {attendanceData?.records?.map(record => (
// //                     <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
// //                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
// //                         <div className="flex items-center gap-2">
// //                           <HiCalendar className="w-4 h-4 text-gray-400" />
// //                           {new Date(record.date).toLocaleDateString()}
// //                         </div>
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
// //                         {record.subject}
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
// //                         {record.teacher_name}
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
// //                         {record.from_time && record.to_time ? (
// //                           <div className="flex items-center gap-1">
// //                             <HiClock className="w-4 h-4" />
// //                             {record.from_time} - {record.to_time}
// //                           </div>
// //                         ) : (
// //                           <div className="flex items-center gap-1">
// //                             <HiClock className="w-4 h-4" />
// //                             {record.time}
// //                           </div>
// //                         )}
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
// //                         {formatDuration(record.duration_minutes)}
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap text-center">
// //                         {record.is_present ? (
// //                           <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
// //                             <HiCheckCircle className="w-4 h-4" />
// //                             Present
// //                           </span>
// //                         ) : (
// //                           <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
// //                             <HiXCircle className="w-4 h-4" />
// //                             Absent
// //                           </span>
// //                         )}
// //                       </td>
// //                     </tr>
// //                   ))}
// //                 </tbody>
// //               </table>
              
// //               {attendanceData?.records?.length === 0 && (
// //                 <div className="text-center py-8 text-gray-500 dark:text-gray-400">
// //                   No attendance records found
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //         </Card>
// //       </div>
// //     </DashboardLayout>
// //   );
// // };

// // export default MyAttendance;































// // // import { useState, useEffect } from 'react';
// // // import { toast } from 'react-hot-toast';
// // // import DashboardLayout from '../../components/layout/DashboardLayout';
// // // import Card from '../../components/common/Card';
// // // import { studentAPI } from '../../services/api';
// // // import { HiCalendar, HiClock, HiCheckCircle, HiXCircle } from 'react-icons/hi';

// // // const MyAttendance = () => {
// // //   const [loading, setLoading] = useState(true);
// // //   const [attendanceData, setAttendanceData] = useState(null);
// // //   const [selectedSubject, setSelectedSubject] = useState('all');
// // //   const [startDate, setStartDate] = useState('');
// // //   const [endDate, setEndDate] = useState('');

// // //   useEffect(() => {
// // //     fetchAttendance();
// // //   }, [selectedSubject, startDate, endDate]);

// // //   const fetchAttendance = async () => {
// // //     try {
// // //       setLoading(true);
// // //       const params = {};
// // //       if (selectedSubject !== 'all') params.subject_id = selectedSubject;
// // //       if (startDate) params.start_date = startDate;
// // //       if (endDate) params.end_date = endDate;

// // //       const response = await studentAPI.getMyAttendance(params);
// // //       setAttendanceData(response.data);
// // //     } catch (error) {
// // //       console.error('Failed to fetch attendance:', error);
// // //       toast.error('Failed to load attendance');
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const getStatusColor = (percentage) => {
// // //     if (percentage >= 75) return 'text-green-600 dark:text-green-400';
// // //     if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
// // //     return 'text-red-600 dark:text-red-400';
// // //   };

// // //   const formatDuration = (minutes) => {
// // //     if (!minutes) return 'N/A';
// // //     const hours = Math.floor(minutes / 60);
// // //     const mins = minutes % 60;
// // //     if (hours === 0) return `${mins} min`;
// // //     if (mins === 0) return `${hours} hr`;
// // //     return `${hours} hr ${mins} min`;
// // //   };

// // //   if (loading) {
// // //     return (
// // //       <DashboardLayout>
// // //         <div className="flex items-center justify-center min-h-screen">
// // //           <div className="text-center">
// // //             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
// // //             <p className="mt-4 text-gray-600 dark:text-gray-400">Loading attendance...</p>
// // //           </div>
// // //         </div>
// // //       </DashboardLayout>
// // //     );
// // //   }

// // //   return (
// // //     <DashboardLayout>
// // //       <div className="p-6 max-w-7xl mx-auto">
// // //         {/* Header */}
// // //         <div className="mb-6">
// // //           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
// // //             My Attendance
// // //           </h1>
// // //           <p className="text-gray-600 dark:text-gray-400 mt-2">
// // //             View your attendance records and statistics
// // //           </p>
// // //         </div>

// // //         {/* Filters */}
// // //         <Card className="mb-6">
// // //           <div className="p-6">
// // //             <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
// // //               Filters
// // //             </h3>
// // //             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// // //               {/* Subject Filter */}
// // //               <div>
// // //                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// // //                   Subject
// // //                 </label>
// // //                 <select
// // //                   value={selectedSubject}
// // //                   onChange={(e) => setSelectedSubject(e.target.value)}
// // //                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
// // //                 >
// // //                   <option value="all">All Subjects</option>
// // //                   {attendanceData?.subjects?.map(subject => (
// // //                     <option key={subject.id} value={subject.id}>
// // //                       {subject.name}
// // //                     </option>
// // //                   ))}
// // //                 </select>
// // //               </div>

// // //               {/* Start Date */}
// // //               <div>
// // //                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// // //                   From Date
// // //                 </label>
// // //                 <input
// // //                   type="date"
// // //                   value={startDate}
// // //                   onChange={(e) => setStartDate(e.target.value)}
// // //                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
// // //                 />
// // //               </div>

// // //               {/* End Date */}
// // //               <div>
// // //                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// // //                   To Date
// // //                 </label>
// // //                 <input
// // //                   type="date"
// // //                   value={endDate}
// // //                   onChange={(e) => setEndDate(e.target.value)}
// // //                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
// // //                 />
// // //               </div>
// // //             </div>
// // //           </div>
// // //         </Card>

// // //         {/* Overall Statistics */}
// // //         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
// // //           <Card className="p-4">
// // //             <p className="text-sm text-gray-500 dark:text-gray-400">Total Classes</p>
// // //             <p className="text-2xl font-bold text-gray-900 dark:text-white">
// // //               {attendanceData?.overall_stats?.total_classes || 0}
// // //             </p>
// // //           </Card>
// // //           <Card className="p-4">
// // //             <p className="text-sm text-gray-500 dark:text-gray-400">Present</p>
// // //             <p className="text-2xl font-bold text-green-600 dark:text-green-400">
// // //               {attendanceData?.overall_stats?.present || 0}
// // //             </p>
// // //           </Card>
// // //           <Card className="p-4">
// // //             <p className="text-sm text-gray-500 dark:text-gray-400">Absent</p>
// // //             <p className="text-2xl font-bold text-red-600 dark:text-red-400">
// // //               {attendanceData?.overall_stats?.absent || 0}
// // //             </p>
// // //           </Card>
// // //           <Card className="p-4">
// // //             <p className="text-sm text-gray-500 dark:text-gray-400">Percentage</p>
// // //             <p className={`text-2xl font-bold ${getStatusColor(attendanceData?.overall_stats?.percentage || 0)}`}>
// // //               {attendanceData?.overall_stats?.percentage?.toFixed(2) || 0}%
// // //             </p>
// // //           </Card>
// // //         </div>

// // //         {/* Subject-wise Statistics */}
// // //         <Card className="mb-6">
// // //           <div className="p-6">
// // //             <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
// // //               Subject-wise Attendance
// // //             </h3>
// // //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
// // //               {attendanceData?.subjects?.map(subject => (
// // //                 <div
// // //                   key={subject.id}
// // //                   className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
// // //                 >
// // //                   <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
// // //                     {subject.name}
// // //                   </h4>
// // //                   <div className="space-y-1 text-sm">
// // //                     <div className="flex justify-between">
// // //                       <span className="text-gray-600 dark:text-gray-400">Total:</span>
// // //                       <span className="font-medium text-gray-900 dark:text-white">
// // //                         {subject.total_classes}
// // //                       </span>
// // //                     </div>
// // //                     <div className="flex justify-between">
// // //                       <span className="text-gray-600 dark:text-gray-400">Present:</span>
// // //                       <span className="font-medium text-green-600 dark:text-green-400">
// // //                         {subject.present}
// // //                       </span>
// // //                     </div>
// // //                     <div className="flex justify-between">
// // //                       <span className="text-gray-600 dark:text-gray-400">Absent:</span>
// // //                       <span className="font-medium text-red-600 dark:text-red-400">
// // //                         {subject.absent}
// // //                       </span>
// // //                     </div>
// // //                     <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
// // //                       <span className="text-gray-600 dark:text-gray-400">Percentage:</span>
// // //                       <span className={`font-bold ${getStatusColor(subject.percentage)}`}>
// // //                         {subject.percentage}%
// // //                       </span>
// // //                     </div>
// // //                   </div>
// // //                 </div>
// // //               ))}
// // //             </div>
// // //           </div>
// // //         </Card>

// // //         {/* Attendance Records Table */}
// // //         <Card>
// // //           <div className="p-6">
// // //             <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
// // //               Attendance Records
// // //             </h3>
// // //             <div className="overflow-x-auto">
// // //               <table className="w-full">
// // //                 <thead className="bg-gray-50 dark:bg-gray-700">
// // //                   <tr>
// // //                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
// // //                       Date
// // //                     </th>
// // //                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
// // //                       Subject
// // //                     </th>
// // //                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
// // //                       Teacher
// // //                     </th>
// // //                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
// // //                       Time
// // //                     </th>
// // //                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
// // //                       Duration
// // //                     </th>
// // //                     <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
// // //                       Status
// // //                     </th>
// // //                   </tr>
// // //                 </thead>
// // //                 <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
// // //                   {attendanceData?.records?.map(record => (
// // //                     <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
// // //                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
// // //                         <div className="flex items-center gap-2">
// // //                           <HiCalendar className="w-4 h-4 text-gray-400" />
// // //                           {new Date(record.date).toLocaleDateString()}
// // //                         </div>
// // //                       </td>
// // //                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
// // //                         {record.subject}
// // //                       </td>
// // //                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
// // //                         {record.teacher_name}
// // //                       </td>
// // //                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
// // //                         {record.from_time && record.to_time ? (
// // //                           <div className="flex items-center gap-1">
// // //                             <HiClock className="w-4 h-4" />
// // //                             {record.from_time} - {record.to_time}
// // //                           </div>
// // //                         ) : (
// // //                           <div className="flex items-center gap-1">
// // //                             <HiClock className="w-4 h-4" />
// // //                             {record.time}
// // //                           </div>
// // //                         )}
// // //                       </td>
// // //                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
// // //                         {formatDuration(record.duration_minutes)}
// // //                       </td>
// // //                       <td className="px-6 py-4 whitespace-nowrap text-center">
// // //                         {record.is_present ? (
// // //                           <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
// // //                             <HiCheckCircle className="w-4 h-4" />
// // //                             Present
// // //                           </span>
// // //                         ) : (
// // //                           <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
// // //                             <HiXCircle className="w-4 h-4" />
// // //                             Absent
// // //                           </span>
// // //                         )}
// // //                       </td>
// // //                     </tr>
// // //                   ))}
// // //                 </tbody>
// // //               </table>
              
// // //               {attendanceData?.records?.length === 0 && (
// // //                 <div className="text-center py-8 text-gray-500 dark:text-gray-400">
// // //                   No attendance records found
// // //                 </div>
// // //               )}
// // //             </div>
// // //           </div>
// // //         </Card>
// // //       </div>
// // //     </DashboardLayout>
// // //   );
// // // };

// // // export default MyAttendance;


















// // // // import { useState, useEffect } from 'react';
// // // // import { Link } from 'react-router-dom';
// // // // import { 
// // // //   HiArrowLeft, 
// // // //   HiCalendar, 
// // // //   HiCheckCircle, 
// // // //   HiXCircle, 
// // // //   HiClock 
// // // // } from 'react-icons/hi';
// // // // import DashboardLayout from '../../components/layout/DashboardLayout';
// // // // import Card from '../../components/common/Card';
// // // // import Loading from '../../components/common/Loading';
// // // // import Button from '../../components/common/Button';
// // // // import { studentAPI } from '../../services/api';
// // // // import toast from 'react-hot-toast';

// // // // const MyAttendance = () => {
// // // //   // Initialize as an empty array to prevent .filter errors before data loads
// // // //   const [attendance, setAttendance] = useState([]);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [stats, setStats] = useState({
// // // //     present: 0,
// // // //     absent: 0,
// // // //     total: 0,
// // // //     percentage: 0
// // // //   });

// // // //   useEffect(() => {
// // // //     fetchAttendance();
// // // //   }, []);

// // // //   const fetchAttendance = async () => {
// // // //     try {
// // // //       const response = await studentAPI.getMyAttendance();
// // // //       // Ensure we set an array even if the API returns something else
// // // //       const attendanceData = Array.isArray(response.data) 
// // // //         ? response.data 
// // // //         : (response.data?.records || []); 
      
// // // //       setAttendance(attendanceData);
      
// // // //       // Calculate stats based on the array
// // // //       const present = attendanceData.filter(a => a.status === 'present').length;
// // // //       const total = attendanceData.length;
// // // //       setStats({
// // // //         present,
// // // //         absent: total - present,
// // // //         total,
// // // //         percentage: total > 0 ? ((present / total) * 100).toFixed(1) : 0
// // // //       });
// // // //     } catch (error) {
// // // //       console.error('Failed to load attendance:', error);
// // // //       toast.error('Failed to load attendance records');
// // // //       setAttendance([]); // Fallback to empty array on error
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   if (loading) return <Loading fullScreen />;

// // // //   return (
// // // //     <DashboardLayout>
// // // //       <div className="p-6 max-w-6xl mx-auto">
// // // //         {/* Header */}
// // // //         <div className="flex items-center space-x-4 mb-8">
// // // //           <Link to="/student/dashboard">
// // // //             <Button variant="secondary" size="sm">
// // // //               <HiArrowLeft className="w-4 h-4 mr-2" />
// // // //               Back to Dashboard
// // // //             </Button>
// // // //           </Link>
// // // //           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
// // // //             My Attendance
// // // //           </h1>
// // // //         </div>

// // // //         {/* Stats Grid */}
// // // //         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
// // // //           <Card className="p-6 bg-white dark:bg-gray-800 border-l-4 border-blue-500">
// // // //             <div className="flex items-center justify-between">
// // // //               <div>
// // // //                 <p className="text-sm text-gray-500 dark:text-gray-400">Total Classes</p>
// // // //                 <p className="text-2xl font-bold dark:text-white">{stats.total}</p>
// // // //               </div>
// // // //               <HiCalendar className="w-8 h-8 text-blue-500 opacity-20" />
// // // //             </div>
// // // //           </Card>

// // // //           <Card className="p-6 bg-white dark:bg-gray-800 border-l-4 border-green-500">
// // // //             <div className="flex items-center justify-between">
// // // //               <div>
// // // //                 <p className="text-sm text-gray-500 dark:text-gray-400">Present</p>
// // // //                 <p className="text-2xl font-bold text-green-600">{stats.present}</p>
// // // //               </div>
// // // //               <HiCheckCircle className="w-8 h-8 text-green-500 opacity-20" />
// // // //             </div>
// // // //           </Card>

// // // //           <Card className="p-6 bg-white dark:bg-gray-800 border-l-4 border-red-500">
// // // //             <div className="flex items-center justify-between">
// // // //               <div>
// // // //                 <p className="text-sm text-gray-500 dark:text-gray-400">Absent</p>
// // // //                 <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
// // // //               </div>
// // // //               <HiXCircle className="w-8 h-8 text-red-500 opacity-20" />
// // // //             </div>
// // // //           </Card>

// // // //           <Card className="p-6 bg-white dark:bg-gray-800 border-l-4 border-purple-500">
// // // //             <div className="flex items-center justify-between">
// // // //               <div>
// // // //                 <p className="text-sm text-gray-500 dark:text-gray-400">Attendance %</p>
// // // //                 <p className="text-2xl font-bold text-purple-600">{stats.percentage}%</p>
// // // //               </div>
// // // //               <HiClock className="w-8 h-8 text-purple-500 opacity-20" />
// // // //             </div>
// // // //           </Card>
// // // //         </div>

// // // //         {/* Attendance Table/List */}
// // // //         <Card className="overflow-hidden bg-white dark:bg-gray-800">
// // // //           <div className="overflow-x-auto">
// // // //             <table className="w-full text-left border-collapse">
// // // //               <thead>
// // // //                 <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
// // // //                   <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Date</th>
// // // //                   <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Subject</th>
// // // //                   <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
// // // //                   <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Remarks</th>
// // // //                 </tr>
// // // //               </thead>
// // // //               <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
// // // //                 {attendance.length > 0 ? (
// // // //                   attendance.map((record, index) => (
// // // //                     <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
// // // //                       <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
// // // //                         {new Date(record.date).toLocaleDateString('en-GB', {
// // // //                           day: '2-digit',
// // // //                           month: 'short',
// // // //                           year: 'numeric'
// // // //                         })}
// // // //                       </td>
// // // //                       <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
// // // //                         {record.subject_name || 'General'}
// // // //                       </td>
// // // //                       <td className="px-6 py-4">
// // // //                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
// // // //                           record.status === 'present' 
// // // //                             ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
// // // //                             : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
// // // //                         }`}>
// // // //                           {record.status.toUpperCase()}
// // // //                         </span>
// // // //                       </td>
// // // //                       <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 italic">
// // // //                         {record.remarks || '-'}
// // // //                       </td>
// // // //                     </tr>
// // // //                   ))
// // // //                 ) : (
// // // //                   <tr>
// // // //                     <td colSpan="4" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
// // // //                       No attendance records found.
// // // //                     </td>
// // // //                   </tr>
// // // //                 )}
// // // //               </tbody>
// // // //             </table>
// // // //           </div>
// // // //         </Card>
// // // //       </div>
// // // //     </DashboardLayout>
// // // //   );
// // // // };

// // // // export default MyAttendance;





















// // // // // import { useState, useEffect } from 'react';
// // // // // import { Link } from 'react-router-dom';
// // // // // import { HiArrowLeft, HiCalendar, HiCheckCircle, HiXCircle } from 'react-icons/hi';
// // // // // import DashboardLayout from '../../components/layout/DashboardLayout';
// // // // // import Card from '../../components/common/Card';
// // // // // import Loading from '../../components/common/Loading';
// // // // // import Button from '../../components/common/Button';
// // // // // import { studentAPI } from '../../services/api';
// // // // // import toast from 'react-hot-toast';

// // // // // const MyAttendance = () => {
// // // // //   const [attendance, setAttendance] = useState([]);
// // // // //   const [loading, setLoading] = useState(true);

// // // // //   useEffect(() => {
// // // // //     fetchAttendance();
// // // // //   }, []);

// // // // //   const fetchAttendance = async () => {
// // // // //     try {
// // // // //       const response = await studentAPI.getMyAttendance();
// // // // //       setAttendance(response.data || []);
// // // // //     } catch (error) {
// // // // //       console.error('Failed to load attendance:', error);
// // // // //       toast.error('Failed to load attendance');
// // // // //     } finally {
// // // // //       setLoading(false);
// // // // //     }
// // // // //   };

// // // // //   if (loading) return <Loading fullScreen />;

// // // // //   const totalDays = attendance.length;
// // // // //   const presentDays = attendance.filter(a => a.is_present).length;
// // // // //   const absentDays = totalDays - presentDays;
// // // // //   const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

// // // // //   return (
// // // // //     <DashboardLayout>
// // // // //       <div className="p-6 max-w-6xl mx-auto">
// // // // //         {/* Header */}
// // // // //         <div className="flex items-center space-x-4 mb-8">
// // // // //           <Link to="/student/dashboard">
// // // // //             <Button variant="secondary" size="sm">
// // // // //               <HiArrowLeft className="w-4 h-4 mr-2" />
// // // // //               Back
// // // // //             </Button>
// // // // //           </Link>
// // // // //           <div>
// // // // //             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
// // // // //               My Attendance
// // // // //             </h1>
// // // // //             <p className="text-gray-600 dark:text-gray-400 mt-1">
// // // // //               Track your class attendance records
// // // // //             </p>
// // // // //           </div>
// // // // //         </div>

// // // // //         {/* Stats Cards */}
// // // // //         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
// // // // //           <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6">
// // // // //             <div className="flex items-center justify-between">
// // // // //               <div>
// // // // //                 <p className="text-blue-100 mb-1">Total Days</p>
// // // // //                 <p className="text-3xl font-bold">{totalDays}</p>
// // // // //               </div>
// // // // //               <HiCalendar className="w-10 h-10 opacity-80" />
// // // // //             </div>
// // // // //           </Card>

// // // // //           <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6">
// // // // //             <div className="flex items-center justify-between">
// // // // //               <div>
// // // // //                 <p className="text-green-100 mb-1">Present</p>
// // // // //                 <p className="text-3xl font-bold">{presentDays}</p>
// // // // //               </div>
// // // // //               <HiCheckCircle className="w-10 h-10 opacity-80" />
// // // // //             </div>
// // // // //           </Card>

// // // // //           <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6">
// // // // //             <div className="flex items-center justify-between">
// // // // //               <div>
// // // // //                 <p className="text-red-100 mb-1">Absent</p>
// // // // //                 <p className="text-3xl font-bold">{absentDays}</p>
// // // // //               </div>
// // // // //               <HiXCircle className="w-10 h-10 opacity-80" />
// // // // //             </div>
// // // // //           </Card>

// // // // //           <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6">
// // // // //             <div className="flex items-center justify-between">
// // // // //               <div>
// // // // //                 <p className="text-purple-100 mb-1">Percentage</p>
// // // // //                 <p className="text-3xl font-bold">{percentage}%</p>
// // // // //               </div>
// // // // //               <HiCalendar className="w-10 h-10 opacity-80" />
// // // // //             </div>
// // // // //           </Card>
// // // // //         </div>

// // // // //         {/* Attendance Records */}
// // // // //         {attendance.length === 0 ? (
// // // // //           <Card className="bg-white dark:bg-gray-800 p-12 text-center">
// // // // //             <HiCalendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
// // // // //             <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
// // // // //               No Attendance Records
// // // // //             </h3>
// // // // //             <p className="text-gray-600 dark:text-gray-400">
// // // // //               Your attendance will appear here once teachers start marking it.
// // // // //             </p>
// // // // //           </Card>
// // // // //         ) : (
// // // // //           <Card className="bg-white dark:bg-gray-800">
// // // // //             <div className="p-6">
// // // // //               <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
// // // // //                 Attendance History
// // // // //               </h2>
// // // // //               <div className="overflow-x-auto">
// // // // //                 <table className="w-full">
// // // // //                   <thead>
// // // // //                     <tr className="border-b border-gray-200 dark:border-gray-700">
// // // // //                       <th className="text-left py-3 px-4 text-gray-900 dark:text-white font-semibold">
// // // // //                         Date
// // // // //                       </th>
// // // // //                       <th className="text-left py-3 px-4 text-gray-900 dark:text-white font-semibold">
// // // // //                         Class
// // // // //                       </th>
// // // // //                       <th className="text-left py-3 px-4 text-gray-900 dark:text-white font-semibold">
// // // // //                         Time
// // // // //                       </th>
// // // // //                       <th className="text-left py-3 px-4 text-gray-900 dark:text-white font-semibold">
// // // // //                         Status
// // // // //                       </th>
// // // // //                     </tr>
// // // // //                   </thead>
// // // // //                   <tbody>
// // // // //                     {attendance.map((record) => (
// // // // //                       <tr 
// // // // //                         key={record.id}
// // // // //                         className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
// // // // //                       >
// // // // //                         <td className="py-4 px-4 text-gray-900 dark:text-white">
// // // // //                           {new Date(record.date).toLocaleDateString('en-US', {
// // // // //                             weekday: 'short',
// // // // //                             year: 'numeric',
// // // // //                             month: 'short',
// // // // //                             day: 'numeric'
// // // // //                           })}
// // // // //                         </td>
// // // // //                         <td className="py-4 px-4 text-gray-900 dark:text-white">
// // // // //                           {record.class_name || 'Class'}
// // // // //                         </td>
// // // // //                         <td className="py-4 px-4 text-gray-900 dark:text-white">
// // // // //                           {record.time}
// // // // //                         </td>
// // // // //                         <td className="py-4 px-4">
// // // // //                           {record.is_present ? (
// // // // //                             <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
// // // // //                               <HiCheckCircle className="w-4 h-4 mr-1" />
// // // // //                               Present
// // // // //                             </span>
// // // // //                           ) : (
// // // // //                             <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
// // // // //                               <HiXCircle className="w-4 h-4 mr-1" />
// // // // //                               Absent
// // // // //                             </span>
// // // // //                           )}
// // // // //                         </td>
// // // // //                       </tr>
// // // // //                     ))}
// // // // //                   </tbody>
// // // // //                 </table>
// // // // //               </div>
// // // // //             </div>
// // // // //           </Card>
// // // // //         )}
// // // // //       </div>
// // // // //     </DashboardLayout>
// // // // //   );
// // // // // };

// // // // // export default MyAttendance;



























// // // // // // import DashboardLayout from '../../components/layout/DashboardLayout';
// // // // // // export default function MyAttendance() {
// // // // // //   return (
// // // // // //     <DashboardLayout>
// // // // // //       <div className="p-6">
// // // // // //         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Attendance - Coming Soon</h1>
// // // // // //       </div>
// // // // // //     </DashboardLayout>
// // // // // //   );
// // // // // // }