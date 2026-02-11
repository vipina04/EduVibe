import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import { teacherAPI } from '../../services/api';
import { HiAcademicCap, HiBookOpen, HiChevronRight, HiUserGroup } from 'react-icons/hi';

const MarkAttendance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getClasses();
      setClasses(response.data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleClassSelect = async (classItem) => {
    setSelectedClass(classItem);
    setSubjects([]); // Reset subjects to empty array
    try {
      const response = await teacherAPI.getClassSubjects(classItem.id);
      console.log('Subjects response:', response); // Debug log
      
      // Handle different response structures
      if (response.data) {
        // If response.data is an array, use it directly
        if (Array.isArray(response.data)) {
          setSubjects(response.data);
        } 
        // If response.data has a subjects property that's an array
        else if (response.data.subjects && Array.isArray(response.data.subjects)) {
          setSubjects(response.data.subjects);
        }
        // If response.data is an object, try to extract subjects
        else if (typeof response.data === 'object') {
          console.warn('Unexpected subjects data structure:', response.data);
          setSubjects([]);
          toast.error('Unexpected data format for subjects');
        }
      } else {
        setSubjects([]);
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      toast.error('Failed to load subjects');
      setSubjects([]); // Ensure subjects is always an array even on error
    }
  };

  const handleSubjectSelect = (subject) => {
    navigate(`/teacher/attendance/mark/${selectedClass.id}/${subject.id}`, {
      state: { className: selectedClass.name, subjectName: subject.name }
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mark Attendance</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Select a class and subject to mark attendance</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <HiAcademicCap className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Select Class</h2>
              </div>

              {classes.length === 0 ? (
                <Card className="p-8 text-center"><p className="text-gray-500 dark:text-gray-400">No classes assigned</p></Card>
              ) : (
                <div className="space-y-3">
                  {classes.map((classItem) => (
                    <Card key={classItem.id} onClick={() => handleClassSelect(classItem)}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        selectedClass?.id === classItem.id ? 'ring-2 ring-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                            <HiUserGroup className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{classItem.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {classItem.students_count || 0} students • {classItem.subjects_count || 0} subjects
                            </p>
                          </div>
                        </div>
                        {selectedClass?.id === classItem.id && <HiChevronRight className="w-5 h-5 text-indigo-600" />}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <HiBookOpen className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Select Subject</h2>
              </div>

              {!selectedClass ? (
                <Card className="p-8 text-center"><p className="text-gray-500 dark:text-gray-400">Please select a class first</p></Card>
              ) : !Array.isArray(subjects) || subjects.length === 0 ? (
                <Card className="p-8 text-center"><p className="text-gray-500 dark:text-gray-400">No subjects assigned for this class</p></Card>
              ) : (
                <div className="space-y-3">
                  {subjects.map((subject) => (
                    <Card key={subject.id} onClick={() => handleSubjectSelect(subject)}
                      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                            <HiBookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div><h3 className="font-semibold text-gray-900 dark:text-white">{subject.name}</h3></div>
                        </div>
                        <HiChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MarkAttendance;




























// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { HiArrowLeft, HiCheckCircle, HiXCircle } from 'react-icons/hi';
// import DashboardLayout from '../../components/layout/DashboardLayout';
// import Card from '../../components/common/Card';
// import Button from '../../components/common/Button';
// import Loading from '../../components/common/Loading';
// import { teacherAPI } from '../../services/api';
// import toast from 'react-hot-toast';

// const MarkAttendance = () => {
//   const { classId, subjectId } = useParams();
//   const navigate = useNavigate();
//   const [students, setStudents] = useState([]);
//   const [attendance, setAttendance] = useState({});
//   const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
//   const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);

//   // useEffect(() => {
//   //   fetchStudents();
//   // }, [classId]);

// useEffect(() => {
//   if (classId) {  // ✅ Add this check
//     fetchStudents();
//   }
// }, [classId]);






//   const fetchStudents = async () => {
//     try {
//       const response = await teacherAPI.getClassStudents(classId);
//       setStudents(response.data || []);
//       const initialAttendance = {};
//       response.data.forEach(student => {
//         initialAttendance[student.id] = true;
//       });
//       setAttendance(initialAttendance);
//     } catch (error) {
//       console.error('Failed to load students:', error);
//       toast.error('Failed to load students');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleAttendance = (studentId) => {
//     setAttendance({
//       ...attendance,
//       [studentId]: !attendance[studentId]
//     });
//   };

//   const markAll = (status) => {
//     const newAttendance = {};
//     students.forEach(student => {
//       newAttendance[student.id] = status;
//     });
//     setAttendance(newAttendance);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);

//     try {
//       const attendanceData = Object.keys(attendance).map(studentId => ({
//         student_id: parseInt(studentId),
//         class_id: parseInt(classId),
//         subject_id: parseInt(subjectId),
//         date,
//         time,
//         is_present: attendance[studentId]
//       }));

//       await teacherAPI.markAttendance({ attendance: attendanceData });
//       toast.success('Attendance marked successfully!');
//       navigate(-1);
//     } catch (error) {
//       console.error('Failed to mark attendance:', error);
//       toast.error('Failed to mark attendance');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading) return <Loading fullScreen />;

//   const presentCount = Object.values(attendance).filter(v => v).length;
//   const absentCount = students.length - presentCount;

//   return (
//     <DashboardLayout>
//       <div className="p-6 max-w-5xl mx-auto">
//         <div className="flex items-center space-x-4 mb-8">
//           <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
//             <HiArrowLeft className="w-4 h-4 mr-2" />
//             Back
//           </Button>
//           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mark Attendance</h1>
//         </div>

//         <form onSubmit={handleSubmit}>
//           <Card className="bg-white dark:bg-gray-800 mb-6">
//             <div className="p-6">
//               <div className="grid grid-cols-2 gap-4 mb-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                     Date *
//                   </label>
//                   <input
//                     type="date"
//                     value={date}
//                     onChange={(e) => setDate(e.target.value)}
//                     className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                     Time *
//                   </label>
//                   <input
//                     type="time"
//                     value={time}
//                     onChange={(e) => setTime(e.target.value)}
//                     className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex space-x-4 text-sm">
//                   <span className="text-green-600 font-semibold">Present: {presentCount}</span>
//                   <span className="text-red-600 font-semibold">Absent: {absentCount}</span>
//                 </div>
//                 <div className="flex space-x-2">
//                   <Button type="button" variant="success" size="sm" onClick={() => markAll(true)}>
//                     Mark All Present
//                   </Button>
//                   <Button type="button" variant="danger" size="sm" onClick={() => markAll(false)}>
//                     Mark All Absent
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </Card>

//           <Card className="bg-white dark:bg-gray-800 mb-6">
//             <div className="p-6">
//               <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Students</h2>
//               <div className="space-y-2">
//                 {students.map((student) => (
//                   <div
//                     key={student.id}
//                     className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer ${
//                       attendance[student.id]
//                         ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
//                         : 'border-red-500 bg-red-50 dark:bg-red-900/20'
//                     }`}
//                     onClick={() => toggleAttendance(student.id)}
//                   >
//                     <div className="flex items-center space-x-3">
//                       {attendance[student.id] ? (
//                         <HiCheckCircle className="w-6 h-6 text-green-600" />
//                       ) : (
//                         <HiXCircle className="w-6 h-6 text-red-600" />
//                       )}
//                       <div>
//                         <p className="font-semibold text-gray-900 dark:text-white">
//                           {student.full_name || student.username}
//                         </p>
//                         <p className="text-sm text-gray-600 dark:text-gray-400">
//                           ID: {student.unique_id}
//                         </p>
//                       </div>
//                     </div>
//                     <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
//                       attendance[student.id]
//                         ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
//                         : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
//                     }`}>
//                       {attendance[student.id] ? 'Present' : 'Absent'}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </Card>

//           <div className="flex justify-end space-x-4">
//             <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
//               Cancel
//             </Button>
//             <Button type="submit" variant="primary" disabled={submitting}>
//               {submitting ? 'Submitting...' : 'Submit Attendance'}
//             </Button>
//           </div>
//         </form>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default MarkAttendance;


















// // import DashboardLayout from '../../components/layout/DashboardLayout';
// // export default function MarkAttendance() {
// //   return (
// //     <DashboardLayout>
// //       <div className="p-6">
// //         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mark Attendance - Coming Soon</h1>
// //       </div>
// //     </DashboardLayout>
// //   );
// // }




















// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-hot-toast';
// import DashboardLayout from '../../components/layout/DashboardLayout';
// import Card from '../../components/common/Card';
// import { teacherAPI } from '../../services/api';
// import { HiAcademicCap, HiBookOpen, HiChevronRight, HiUserGroup } from 'react-icons/hi';

// const MarkAttendance = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [classes, setClasses] = useState([]);
//   const [selectedClass, setSelectedClass] = useState(null);
//   const [subjects, setSubjects] = useState([]);

//   useEffect(() => {
//     fetchClasses();
//   }, []);

//   const fetchClasses = async () => {
//     try {
//       setLoading(true);
//       const response = await teacherAPI.getClasses();
//       setClasses(response.data);
//     } catch (error) {
//       console.error('Failed to fetch classes:', error);
//       toast.error('Failed to load classes');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleClassSelect = async (classItem) => {
//     setSelectedClass(classItem);
//     try {
//       const response = await teacherAPI.getClassSubjects(classItem.id);
//       setSubjects(response.data);
//     } catch (error) {
//       console.error('Failed to fetch subjects:', error);
//       toast.error('Failed to load subjects');
//     }
//   };

//   const handleSubjectSelect = (subject) => {
//     navigate(`/teacher/attendance/mark/${selectedClass.id}/${subject.id}`, {
//       state: { className: selectedClass.name, subjectName: subject.name }
//     });
//   };

//   return (
//     <DashboardLayout>
//       <div className="p-6 max-w-7xl mx-auto">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mark Attendance</h1>
//           <p className="text-gray-600 dark:text-gray-400 mt-2">Select a class and subject to mark attendance</p>
//         </div>

//         {loading ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             <div>
//               <div className="flex items-center gap-3 mb-4">
//                 <HiAcademicCap className="w-6 h-6 text-indigo-600" />
//                 <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Select Class</h2>
//               </div>

//               {classes.length === 0 ? (
//                 <Card className="p-8 text-center"><p className="text-gray-500 dark:text-gray-400">No classes assigned</p></Card>
//               ) : (
//                 <div className="space-y-3">
//                   {classes.map((classItem) => (
//                     <Card key={classItem.id} onClick={() => handleClassSelect(classItem)}
//                       className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
//                         selectedClass?.id === classItem.id ? 'ring-2 ring-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
//                       <div className="flex items-center justify-between p-4">
//                         <div className="flex items-center gap-3">
//                           <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
//                             <HiUserGroup className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
//                           </div>
//                           <div>
//                             <h3 className="font-semibold text-gray-900 dark:text-white">{classItem.name}</h3>
//                             <p className="text-sm text-gray-500 dark:text-gray-400">
//                               {classItem.students_count || 0} students • {classItem.subjects_count || 0} subjects
//                             </p>
//                           </div>
//                         </div>
//                         {selectedClass?.id === classItem.id && <HiChevronRight className="w-5 h-5 text-indigo-600" />}
//                       </div>
//                     </Card>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div>
//               <div className="flex items-center gap-3 mb-4">
//                 <HiBookOpen className="w-6 h-6 text-green-600" />
//                 <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Select Subject</h2>
//               </div>

//               {!selectedClass ? (
//                 <Card className="p-8 text-center"><p className="text-gray-500 dark:text-gray-400">Please select a class first</p></Card>
//               ) : subjects.length === 0 ? (
//                 <Card className="p-8 text-center"><p className="text-gray-500 dark:text-gray-400">No subjects assigned for this class</p></Card>
//               ) : (
//                 <div className="space-y-3">
//                   {subjects.map((subject) => (
//                     <Card key={subject.id} onClick={() => handleSubjectSelect(subject)}
//                       className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700">
//                       <div className="flex items-center justify-between p-4">
//                         <div className="flex items-center gap-3">
//                           <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
//                             <HiBookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
//                           </div>
//                           <div><h3 className="font-semibold text-gray-900 dark:text-white">{subject.name}</h3></div>
//                         </div>
//                         <HiChevronRight className="w-5 h-5 text-gray-400" />
//                       </div>
//                     </Card>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// };

// export default MarkAttendance;




























// // import { useState, useEffect } from 'react';
// // import { useParams, useNavigate } from 'react-router-dom';
// // import { HiArrowLeft, HiCheckCircle, HiXCircle } from 'react-icons/hi';
// // import DashboardLayout from '../../components/layout/DashboardLayout';
// // import Card from '../../components/common/Card';
// // import Button from '../../components/common/Button';
// // import Loading from '../../components/common/Loading';
// // import { teacherAPI } from '../../services/api';
// // import toast from 'react-hot-toast';

// // const MarkAttendance = () => {
// //   const { classId, subjectId } = useParams();
// //   const navigate = useNavigate();
// //   const [students, setStudents] = useState([]);
// //   const [attendance, setAttendance] = useState({});
// //   const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
// //   const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
// //   const [loading, setLoading] = useState(true);
// //   const [submitting, setSubmitting] = useState(false);

// //   // useEffect(() => {
// //   //   fetchStudents();
// //   // }, [classId]);

// // useEffect(() => {
// //   if (classId) {  // ✅ Add this check
// //     fetchStudents();
// //   }
// // }, [classId]);






// //   const fetchStudents = async () => {
// //     try {
// //       const response = await teacherAPI.getClassStudents(classId);
// //       setStudents(response.data || []);
// //       const initialAttendance = {};
// //       response.data.forEach(student => {
// //         initialAttendance[student.id] = true;
// //       });
// //       setAttendance(initialAttendance);
// //     } catch (error) {
// //       console.error('Failed to load students:', error);
// //       toast.error('Failed to load students');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const toggleAttendance = (studentId) => {
// //     setAttendance({
// //       ...attendance,
// //       [studentId]: !attendance[studentId]
// //     });
// //   };

// //   const markAll = (status) => {
// //     const newAttendance = {};
// //     students.forEach(student => {
// //       newAttendance[student.id] = status;
// //     });
// //     setAttendance(newAttendance);
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setSubmitting(true);

// //     try {
// //       const attendanceData = Object.keys(attendance).map(studentId => ({
// //         student_id: parseInt(studentId),
// //         class_id: parseInt(classId),
// //         subject_id: parseInt(subjectId),
// //         date,
// //         time,
// //         is_present: attendance[studentId]
// //       }));

// //       await teacherAPI.markAttendance({ attendance: attendanceData });
// //       toast.success('Attendance marked successfully!');
// //       navigate(-1);
// //     } catch (error) {
// //       console.error('Failed to mark attendance:', error);
// //       toast.error('Failed to mark attendance');
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };

// //   if (loading) return <Loading fullScreen />;

// //   const presentCount = Object.values(attendance).filter(v => v).length;
// //   const absentCount = students.length - presentCount;

// //   return (
// //     <DashboardLayout>
// //       <div className="p-6 max-w-5xl mx-auto">
// //         <div className="flex items-center space-x-4 mb-8">
// //           <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
// //             <HiArrowLeft className="w-4 h-4 mr-2" />
// //             Back
// //           </Button>
// //           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mark Attendance</h1>
// //         </div>

// //         <form onSubmit={handleSubmit}>
// //           <Card className="bg-white dark:bg-gray-800 mb-6">
// //             <div className="p-6">
// //               <div className="grid grid-cols-2 gap-4 mb-6">
// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                     Date *
// //                   </label>
// //                   <input
// //                     type="date"
// //                     value={date}
// //                     onChange={(e) => setDate(e.target.value)}
// //                     className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// //                     required
// //                   />
// //                 </div>
// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                     Time *
// //                   </label>
// //                   <input
// //                     type="time"
// //                     value={time}
// //                     onChange={(e) => setTime(e.target.value)}
// //                     className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
// //                     required
// //                   />
// //                 </div>
// //               </div>

// //               <div className="flex items-center justify-between mb-4">
// //                 <div className="flex space-x-4 text-sm">
// //                   <span className="text-green-600 font-semibold">Present: {presentCount}</span>
// //                   <span className="text-red-600 font-semibold">Absent: {absentCount}</span>
// //                 </div>
// //                 <div className="flex space-x-2">
// //                   <Button type="button" variant="success" size="sm" onClick={() => markAll(true)}>
// //                     Mark All Present
// //                   </Button>
// //                   <Button type="button" variant="danger" size="sm" onClick={() => markAll(false)}>
// //                     Mark All Absent
// //                   </Button>
// //                 </div>
// //               </div>
// //             </div>
// //           </Card>

// //           <Card className="bg-white dark:bg-gray-800 mb-6">
// //             <div className="p-6">
// //               <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Students</h2>
// //               <div className="space-y-2">
// //                 {students.map((student) => (
// //                   <div
// //                     key={student.id}
// //                     className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer ${
// //                       attendance[student.id]
// //                         ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
// //                         : 'border-red-500 bg-red-50 dark:bg-red-900/20'
// //                     }`}
// //                     onClick={() => toggleAttendance(student.id)}
// //                   >
// //                     <div className="flex items-center space-x-3">
// //                       {attendance[student.id] ? (
// //                         <HiCheckCircle className="w-6 h-6 text-green-600" />
// //                       ) : (
// //                         <HiXCircle className="w-6 h-6 text-red-600" />
// //                       )}
// //                       <div>
// //                         <p className="font-semibold text-gray-900 dark:text-white">
// //                           {student.full_name || student.username}
// //                         </p>
// //                         <p className="text-sm text-gray-600 dark:text-gray-400">
// //                           ID: {student.unique_id}
// //                         </p>
// //                       </div>
// //                     </div>
// //                     <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
// //                       attendance[student.id]
// //                         ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
// //                         : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
// //                     }`}>
// //                       {attendance[student.id] ? 'Present' : 'Absent'}
// //                     </span>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           </Card>

// //           <div className="flex justify-end space-x-4">
// //             <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
// //               Cancel
// //             </Button>
// //             <Button type="submit" variant="primary" disabled={submitting}>
// //               {submitting ? 'Submitting...' : 'Submit Attendance'}
// //             </Button>
// //           </div>
// //         </form>
// //       </div>
// //     </DashboardLayout>
// //   );
// // };

// // export default MarkAttendance;


















// // // import DashboardLayout from '../../components/layout/DashboardLayout';
// // // export default function MarkAttendance() {
// // //   return (
// // //     <DashboardLayout>
// // //       <div className="p-6">
// // //         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mark Attendance - Coming Soon</h1>
// // //       </div>
// // //     </DashboardLayout>
// // //   );
// // // }