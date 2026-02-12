import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import { teacherAPI } from '../../services/api';
import { HiArrowLeft, HiCalendar, HiClock, HiAcademicCap } from 'react-icons/hi';

const AttendanceHistory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState(null);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]); // Store all subjects from assignments

  useEffect(() => {
    fetchClasses();
    fetchTeacherAssignments();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [selectedClass, selectedSubject, startDate, endDate]);

  // Update subjects when class changes
  useEffect(() => {
    if (selectedClass === 'all') {
      // Show all subjects when "All Classes" is selected
      setSubjects(allSubjects);
    } else {
      // Filter subjects by selected class
      const filteredSubjects = allSubjects.filter(
        subj => subj.class_id === parseInt(selectedClass)
      );
      setSubjects(filteredSubjects);
      
      // Reset subject selection if current subject is not available for this class
      if (selectedSubject !== 'all') {
        const subjectExists = filteredSubjects.some(
          subj => subj.subject_id === parseInt(selectedSubject)
        );
        if (!subjectExists) {
          setSelectedSubject('all');
        }
      }
    }
  }, [selectedClass, allSubjects]);

  const fetchClasses = async () => {
    try {
      const response = await teacherAPI.getClasses();
      setClasses(response.data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchTeacherAssignments = async () => {
    try {
      // Fetch teacher's dashboard to get assignments
      const response = await teacherAPI.getDashboard();
      
      console.log('Dashboard response:', response.data); // Debug log
      
      if (response.data && response.data.assignments) {
        // Extract unique subjects from assignments
        const subjectsMap = new Map();
        
        response.data.assignments.forEach(assignment => {
          // The API returns nested objects: assignment.class and assignment.subject
          const classId = assignment.class?.id;
          const subjectId = assignment.subject?.id;
          const className = assignment.class?.name;
          const subjectName = assignment.subject?.name;
          
          if (classId && subjectId) {
            const key = `${classId}-${subjectId}`;
            if (!subjectsMap.has(key)) {
              subjectsMap.set(key, {
                subject_id: subjectId,
                subject_name: subjectName,
                class_id: classId,
                class_name: className
              });
            }
          }
        });
        
        const uniqueSubjects = Array.from(subjectsMap.values());
        console.log('Extracted subjects:', uniqueSubjects); // Debug log
        setAllSubjects(uniqueSubjects);
        setSubjects(uniqueSubjects);
      }
    } catch (error) {
      console.error('Failed to fetch teacher assignments:', error);
      toast.error('Failed to load subjects');
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedClass !== 'all') params.class_id = selectedClass;
      if (selectedSubject !== 'all') params.subject_id = selectedSubject;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await teacherAPI.getAttendanceHistory(params);
      setHistoryData(response.data);
    } catch (error) {
      console.error('Failed to fetch attendance history:', error);
      toast.error('Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
  };

  const formatHours = (hours) => {
    return `${hours} hrs`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading attendance history...</p>
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
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <HiArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Attendance History
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View your attendance records and time spent on each class
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Filters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Class Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="all">All Classes</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={subjects.length === 0}
                >
                  <option value="all">All Subjects</option>
                  {subjects.map(subj => (
                    <option key={`${subj.class_id}-${subj.subject_id}`} value={subj.subject_id}>
                      {subj.subject_name}
                      {selectedClass === 'all' && ` (${subj.class_name})`}
                    </option>
                  ))}
                </select>
                {subjects.length === 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    No subjects available
                  </p>
                )}
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Sessions</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {historyData?.overall_stats?.total_sessions || 0}
            </p>
          </Card>
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Time (Minutes)</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {historyData?.overall_stats?.total_duration_minutes || 0}
            </p>
          </Card>
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Time (Hours)</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {historyData?.overall_stats?.total_duration_hours?.toFixed(2) || 0}
            </p>
          </Card>
        </div>

        {/* Class-wise Statistics */}
        {historyData?.stats_by_class && historyData.stats_by_class.length > 0 && (
          <Card className="mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Time Spent by Class
              </h3>
              <div className="space-y-4">
                {historyData.stats_by_class.map(classData => (
                  <div
                    key={classData.class_id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <HiAcademicCap className="w-5 h-5 text-blue-600" />
                        {classData.class_name}
                      </h4>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {classData.total_sessions} sessions
                        </p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {formatHours(classData.total_duration_hours)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Subject breakdown */}
                    {classData.subjects && classData.subjects.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                        {classData.subjects.map(subject => (
                          <div
                            key={subject.subject_id}
                            className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            <p className="font-medium text-gray-900 dark:text-white mb-2">
                              {subject.subject_name}
                            </p>
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Sessions:</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {subject.sessions}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Time:</span>
                                <span className="font-medium text-green-600 dark:text-green-400">
                                  {formatHours(subject.duration_hours)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Session Details Table */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Session Details
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Students
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {historyData?.sessions?.map((session, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <HiCalendar className="w-4 h-4 text-gray-400" />
                          {new Date(session.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {session.class_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {session.subject_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {session.from_time && session.to_time ? (
                          <div className="flex items-center gap-1">
                            <HiClock className="w-4 h-4" />
                            {session.from_time} - {session.to_time}
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                        {formatDuration(session.duration_minutes)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            P: {session.present}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            A: {session.absent}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            Total: {session.total_students}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {(!historyData?.sessions || historyData.sessions.length === 0) && (
                <div className="text-center py-12">
                  <HiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                    No attendance sessions found
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                    Try adjusting your filters or mark attendance for a class
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AttendanceHistory;



























// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-hot-toast';
// import DashboardLayout from '../../components/layout/DashboardLayout';
// import Card from '../../components/common/Card';
// import { teacherAPI } from '../../services/api';
// import { HiArrowLeft, HiCalendar, HiClock, HiAcademicCap } from 'react-icons/hi';

// const AttendanceHistory = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [historyData, setHistoryData] = useState(null);
//   const [selectedClass, setSelectedClass] = useState('all');
//   const [selectedSubject, setSelectedSubject] = useState('all');
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [classes, setClasses] = useState([]);

//   useEffect(() => {
//     fetchClasses();
//   }, []);

//   useEffect(() => {
//     fetchHistory();
//   }, [selectedClass, selectedSubject, startDate, endDate]);

//   const fetchClasses = async () => {
//     try {
//       const response = await teacherAPI.getClasses();
//       setClasses(response.data);
//     } catch (error) {
//       console.error('Failed to fetch classes:', error);
//     }
//   };

//   const fetchHistory = async () => {
//     try {
//       setLoading(true);
//       const params = {};
//       if (selectedClass !== 'all') params.class_id = selectedClass;
//       if (selectedSubject !== 'all') params.subject_id = selectedSubject;
//       if (startDate) params.start_date = startDate;
//       if (endDate) params.end_date = endDate;

//       const response = await teacherAPI.getAttendanceHistory(params);
//       setHistoryData(response.data);
//     } catch (error) {
//       console.error('Failed to fetch attendance history:', error);
//       toast.error('Failed to load attendance history');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatDuration = (minutes) => {
//     if (!minutes) return 'N/A';
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     if (hours === 0) return `${mins} min`;
//     if (mins === 0) return `${hours} hr`;
//     return `${hours} hr ${mins} min`;
//   };

//   const formatHours = (hours) => {
//     return `${hours} hrs`;
//   };

//   if (loading) {
//     return (
//       <DashboardLayout>
//         <div className="flex items-center justify-center min-h-screen">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//             <p className="mt-4 text-gray-600 dark:text-gray-400">Loading attendance history...</p>
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
//           <button
//             onClick={() => navigate('/teacher/dashboard')}
//             className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
//           >
//             <HiArrowLeft className="w-5 h-5" />
//             Back to Dashboard
//           </button>
          
//           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
//             Attendance History
//           </h1>
//           <p className="text-gray-600 dark:text-gray-400 mt-2">
//             View your attendance records and time spent on each class
//           </p>
//         </div>

//         {/* Filters */}
//         <Card className="mb-6">
//           <div className="p-6">
//             <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
//               Filters
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//               {/* Class Filter */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                   Class
//                 </label>
//                 <select
//                   value={selectedClass}
//                   onChange={(e) => setSelectedClass(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
//                 >
//                   <option value="all">All Classes</option>
//                   {classes.map(cls => (
//                     <option key={cls.id} value={cls.id}>
//                       {cls.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Subject Filter - You can populate this based on selected class */}
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
//                   {/* Add subject options here */}
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
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//           <Card className="p-4">
//             <p className="text-sm text-gray-500 dark:text-gray-400">Total Sessions</p>
//             <p className="text-2xl font-bold text-gray-900 dark:text-white">
//               {historyData?.overall_stats?.total_sessions || 0}
//             </p>
//           </Card>
//           <Card className="p-4">
//             <p className="text-sm text-gray-500 dark:text-gray-400">Total Time (Minutes)</p>
//             <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
//               {historyData?.overall_stats?.total_duration_minutes || 0}
//             </p>
//           </Card>
//           <Card className="p-4">
//             <p className="text-sm text-gray-500 dark:text-gray-400">Total Time (Hours)</p>
//             <p className="text-2xl font-bold text-green-600 dark:text-green-400">
//               {historyData?.overall_stats?.total_duration_hours || 0}
//             </p>
//           </Card>
//         </div>

//         {/* Class-wise Statistics */}
//         <Card className="mb-6">
//           <div className="p-6">
//             <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
//               Time Spent by Class
//             </h3>
//             <div className="space-y-4">
//               {historyData?.stats_by_class?.map(classData => (
//                 <div
//                   key={classData.class_id}
//                   className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
//                 >
//                   <div className="flex items-center justify-between mb-3">
//                     <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
//                       <HiAcademicCap className="w-5 h-5" />
//                       {classData.class_name}
//                     </h4>
//                     <div className="text-right">
//                       <p className="text-sm text-gray-500 dark:text-gray-400">
//                         {classData.total_sessions} sessions
//                       </p>
//                       <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
//                         {formatHours(classData.total_duration_hours)}
//                       </p>
//                     </div>
//                   </div>
                  
//                   {/* Subject breakdown */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
//                     {classData.subjects?.map(subject => (
//                       <div
//                         key={subject.subject_id}
//                         className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
//                       >
//                         <p className="font-medium text-gray-900 dark:text-white mb-1">
//                           {subject.subject_name}
//                         </p>
//                         <div className="text-sm space-y-1">
//                           <div className="flex justify-between">
//                             <span className="text-gray-600 dark:text-gray-400">Sessions:</span>
//                             <span className="font-medium text-gray-900 dark:text-white">
//                               {subject.sessions}
//                             </span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="text-gray-600 dark:text-gray-400">Time:</span>
//                             <span className="font-medium text-green-600 dark:text-green-400">
//                               {formatHours(subject.duration_hours)}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </Card>

//         {/* Session Details Table */}
//         <Card>
//           <div className="p-6">
//             <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
//               Session Details
//             </h3>
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50 dark:bg-gray-700">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                       Date
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                       Class
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                       Subject
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                       Time
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                       Duration
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                       Students
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
//                   {historyData?.sessions?.map((session, index) => (
//                     <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
//                         <div className="flex items-center gap-2">
//                           <HiCalendar className="w-4 h-4 text-gray-400" />
//                           {new Date(session.date).toLocaleDateString()}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
//                         {session.class_name}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
//                         {session.subject_name}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
//                         {session.from_time && session.to_time ? (
//                           <div className="flex items-center gap-1">
//                             <HiClock className="w-4 h-4" />
//                             {session.from_time} - {session.to_time}
//                           </div>
//                         ) : (
//                           'N/A'
//                         )}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
//                         {formatDuration(session.duration_minutes)}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
//                         <div className="flex items-center gap-4">
//                           <span className="text-green-600 dark:text-green-400">
//                             P: {session.present}
//                           </span>
//                           <span className="text-red-600 dark:text-red-400">
//                             A: {session.absent}
//                           </span>
//                           <span className="text-gray-600 dark:text-gray-400">
//                             T: {session.total_students}
//                           </span>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
              
//               {historyData?.sessions?.length === 0 && (
//                 <div className="text-center py-8 text-gray-500 dark:text-gray-400">
//                   No attendance sessions found
//                 </div>
//               )}
//             </div>
//           </div>
//         </Card>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default AttendanceHistory;

























// // import DashboardLayout from '../../components/layout/DashboardLayout';
// // import Card from '../../components/common/Card';
// // import { HiArrowLeft, HiCalendar } from 'react-icons/hi';
// // import { Link } from 'react-router-dom';
// // import Button from '../../components/common/Button';

// // const AttendanceHistory = () => {
// //   return (
// //     <DashboardLayout>
// //       <div className="p-6 max-w-6xl mx-auto">
// //         <div className="flex items-center space-x-4 mb-8">
// //           <Link to="/teacher/dashboard">
// //             <Button variant="secondary" size="sm">
// //               <HiArrowLeft className="w-4 h-4 mr-2" />
// //               Back
// //             </Button>
// //           </Link>
// //           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Attendance History</h1>
// //         </div>
// //         <Card className="bg-white dark:bg-gray-800 p-12 text-center">
// //           <HiCalendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
// //           <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Coming Soon</h3>
// //           <p className="text-gray-600 dark:text-gray-400 mt-2">Attendance history will be available here</p>
// //         </Card>
// //       </div>
// //     </DashboardLayout>
// //   );
// // };

// // export default AttendanceHistory;




















// // // import DashboardLayout from '../../components/layout/DashboardLayout';
// // // export default function AttendanceHistory() {
// // //   return (
// // //     <DashboardLayout>
// // //       <div className="p-6">
// // //         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance History - Coming Soon</h1>
// // //       </div>
// // //     </DashboardLayout>
// // //   );
// // // }