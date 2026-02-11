import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HiArrowLeft, 
  HiAcademicCap, 
  HiBookOpen,
  HiChevronRight,
  HiClipboardList 
} from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { teacherAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TeacherTestSelection = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [classData, setClassData] = useState({});

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await teacherAPI.getSubjects();
      setSubjects(response.data || []);
    } catch (error) {
      console.error('Failed to load subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassesForSubject = async (subjectId) => {
    if (classData[subjectId]) {
      // Already fetched, just toggle
      setExpandedSubject(expandedSubject === subjectId ? null : subjectId);
      return;
    }

    try {
      // FIXED: Use query parameter instead of path parameter
      const response = await teacherAPI.getSubjectClasses(subjectId);
      
      // DEBUG: Log the response to see what we get
      console.log('API Response for classes:', response.data);
      
      // The API returns a simple array like [{id: 1, name: "Class 10"}, ...]
      // We need to ensure it's an array
      const classes = Array.isArray(response.data) ? response.data : (response.data.classes || []);
      
      setClassData(prev => ({
        ...prev,
        [subjectId]: classes
      }));
      setExpandedSubject(subjectId);
    } catch (error) {
      console.error('Failed to load classes:', error);
      toast.error('Failed to load classes for this subject');
    }
  };

  const handleClassClick = async (subjectId, classId) => {
    // Fetch chapters for this subject-class combination
    try {
      const response = await teacherAPI.getClassChapters(classId, subjectId);
      const chapters = response.data || [];
      
      if (chapters.length === 0) {
        toast.error('No chapters found for this class. Please create chapters first.');
        return;
      }

      // Navigate to chapter selection or directly to create test
      navigate('/teacher/test/select-chapter', {
        state: {
          subjectId,
          classId,
          chapters
        }
      });
    } catch (error) {
      console.error('Failed to load chapters:', error);
      toast.error('Failed to load chapters');
    }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/teacher/dashboard">
              <Button variant="secondary" size="sm">
                <HiArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Create Test
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Select a subject and class to create a test
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 mb-6">
          <div className="p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              How to Create a Test:
            </h3>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
              <li>Select a subject you teach (click to expand)</li>
              <li>Choose the class you want to create a test for</li>
              <li>Select the chapter for this test</li>
              <li>Fill in test details and add questions</li>
            </ol>
          </div>
        </Card>

        {/* Subjects List */}
        {subjects.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 p-12 text-center">
            <HiAcademicCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Subjects Assigned
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You haven't been assigned to teach any subjects yet. Contact admin for assistance.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {subjects.map((subject) => (
              <Card key={subject.id} className="bg-white dark:bg-gray-800">
                <div>
                  {/* Subject Header */}
                  <button
                    onClick={() => fetchClassesForSubject(subject.id)}
                    className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <HiBookOpen className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {subject.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Click to view classes
                        </p>
                      </div>
                    </div>
                    <HiChevronRight 
                      className={`w-6 h-6 text-gray-400 transition-transform ${
                        expandedSubject === subject.id ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  {/* Classes List (Expanded) */}
                  {expandedSubject === subject.id && classData[subject.id] && (
                    <div className="border-t border-gray-200 dark:border-gray-700">
                      {classData[subject.id].length === 0 ? (
                        <div className="p-6 text-center">
                          <p className="text-gray-600 dark:text-gray-400">
                            No classes assigned for this subject
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 space-y-2">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-2 mb-3">
                            Select a class:
                          </p>
                          {classData[subject.id].map((classItem) => (
                            <button
                              key={classItem.id}
                              onClick={() => handleClassClick(subject.id, classItem.id)}
                              className="w-full p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-between group"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                  <HiAcademicCap className="w-5 h-5 text-green-600 dark:text-green-300" />
                                </div>
                                <div className="text-left">
                                  <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {classItem.name}
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Click to select chapters
                                  </p>
                                </div>
                              </div>
                              <HiClipboardList className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherTestSelection;





















// import { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { 
//   HiArrowLeft, 
//   HiAcademicCap, 
//   HiBookOpen,
//   HiChevronRight,
//   HiClipboardList 
// } from 'react-icons/hi';
// import DashboardLayout from '../../components/layout/DashboardLayout';
// import Card from '../../components/common/Card';
// import Loading from '../../components/common/Loading';
// import Button from '../../components/common/Button';
// import { teacherAPI } from '../../services/api';
// import toast from 'react-hot-toast';

// const TeacherTestSelection = () => {
//   const navigate = useNavigate();
//   const [subjects, setSubjects] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [expandedSubject, setExpandedSubject] = useState(null);
//   const [classData, setClassData] = useState({});

//   useEffect(() => {
//     fetchSubjects();
//   }, []);

//   const fetchSubjects = async () => {
//     try {
//       const response = await teacherAPI.getSubjects();
//       setSubjects(response.data || []);
//     } catch (error) {
//       console.error('Failed to load subjects:', error);
//       toast.error('Failed to load subjects');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchClassesForSubject = async (subjectId) => {
//     if (classData[subjectId]) {
//       // Already fetched, just toggle
//       setExpandedSubject(expandedSubject === subjectId ? null : subjectId);
//       return;
//     }

//     try {
//       const response = await teacherAPI.getSubjectClasses(subjectId);
//       setClassData(prev => ({
//         ...prev,
//         [subjectId]: response.data.classes || []
//       }));
//       setExpandedSubject(subjectId);
//     } catch (error) {
//       console.error('Failed to load classes:', error);
//       toast.error('Failed to load classes for this subject');
//     }
//   };

//   const handleClassClick = async (subjectId, classId) => {
//     // Fetch chapters for this subject-class combination
//     try {
//       const response = await teacherAPI.getClassChapters(classId, subjectId);
//       const chapters = response.data || [];
      
//       if (chapters.length === 0) {
//         toast.error('No chapters found for this class. Please create chapters first.');
//         return;
//       }

//       // Navigate to chapter selection or directly to create test
//       navigate('/teacher/test/select-chapter', {
//         state: {
//           subjectId,
//           classId,
//           chapters
//         }
//       });
//     } catch (error) {
//       console.error('Failed to load chapters:', error);
//       toast.error('Failed to load chapters');
//     }
//   };

//   if (loading) return <Loading fullScreen />;

//   return (
//     <DashboardLayout>
//       <div className="p-6 max-w-6xl mx-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <div className="flex items-center space-x-4">
//             <Link to="/teacher/dashboard">
//               <Button variant="secondary" size="sm">
//                 <HiArrowLeft className="w-4 h-4 mr-2" />
//                 Back
//               </Button>
//             </Link>
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
//                 Create Test
//               </h1>
//               <p className="text-gray-600 dark:text-gray-400 mt-1">
//                 Select a subject and class to create a test
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Instructions */}
//         <Card className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 mb-6">
//           <div className="p-4">
//             <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
//               How to Create a Test:
//             </h3>
//             <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
//               <li>Select a subject you teach (click to expand)</li>
//               <li>Choose the class you want to create a test for</li>
//               <li>Select the chapter for this test</li>
//               <li>Fill in test details and add questions</li>
//             </ol>
//           </div>
//         </Card>

//         {/* Subjects List */}
//         {subjects.length === 0 ? (
//           <Card className="bg-white dark:bg-gray-800 p-12 text-center">
//             <HiAcademicCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
//               No Subjects Assigned
//             </h3>
//             <p className="text-gray-600 dark:text-gray-400">
//               You haven't been assigned to teach any subjects yet. Contact admin for assistance.
//             </p>
//           </Card>
//         ) : (
//           <div className="space-y-4">
//             {subjects.map((subject) => (
//               <Card key={subject.id} className="bg-white dark:bg-gray-800">
//                 <div>
//                   {/* Subject Header */}
//                   <button
//                     onClick={() => fetchClassesForSubject(subject.id)}
//                     className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
//                   >
//                     <div className="flex items-center space-x-4">
//                       <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
//                         <HiBookOpen className="w-6 h-6 text-blue-600 dark:text-blue-300" />
//                       </div>
//                       <div>
//                         <h3 className="text-lg font-bold text-gray-900 dark:text-white">
//                           {subject.name}
//                         </h3>
//                         <p className="text-sm text-gray-600 dark:text-gray-400">
//                           Click to view classes
//                         </p>
//                       </div>
//                     </div>
//                     <HiChevronRight 
//                       className={`w-6 h-6 text-gray-400 transition-transform ${
//                         expandedSubject === subject.id ? 'rotate-90' : ''
//                       }`}
//                     />
//                   </button>

//                   {/* Classes List (Expanded) */}
//                   {expandedSubject === subject.id && classData[subject.id] && (
//                     <div className="border-t border-gray-200 dark:border-gray-700">
//                       {classData[subject.id].length === 0 ? (
//                         <div className="p-6 text-center">
//                           <p className="text-gray-600 dark:text-gray-400">
//                             No classes assigned for this subject
//                           </p>
//                         </div>
//                       ) : (
//                         <div className="p-4 space-y-2">
//                           <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-2 mb-3">
//                             Select a class:
//                           </p>
//                           {classData[subject.id].map((classItem) => (
//                             <button
//                               key={classItem.class.id}
//                               onClick={() => handleClassClick(subject.id, classItem.class.id)}
//                               className="w-full p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-between group"
//                             >
//                               <div className="flex items-center space-x-3">
//                                 <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
//                                   <HiAcademicCap className="w-5 h-5 text-green-600 dark:text-green-300" />
//                                 </div>
//                                 <div className="text-left">
//                                   <h4 className="font-semibold text-gray-900 dark:text-white">
//                                     {classItem.class.name}
//                                   </h4>
//                                   <p className="text-sm text-gray-600 dark:text-gray-400">
//                                     {classItem.total_chapters || 0} chapters • {classItem.student_count || 0} students
//                                   </p>
//                                 </div>
//                               </div>
//                               <HiClipboardList className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
//                             </button>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </Card>
//             ))}
//           </div>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// };

// export default TeacherTestSelection;



































// import { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { 
//   HiArrowLeft, 
//   HiAcademicCap, 
//   HiBookOpen,
//   HiChevronRight,
//   HiClipboardList 
// } from 'react-icons/hi';
// import DashboardLayout from '../../components/layout/DashboardLayout';
// import Card from '../../components/common/Card';
// import Loading from '../../components/common/Loading';
// import Button from '../../components/common/Button';
// import { teacherAPI } from '../../services/api';
// import toast from 'react-hot-toast';

// const TeacherTestSelection = () => {
//   const navigate = useNavigate();
//   const [subjects, setSubjects] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [expandedSubject, setExpandedSubject] = useState(null);
//   const [classData, setClassData] = useState({});

//   useEffect(() => {
//     fetchSubjects();
//   }, []);

//   const fetchSubjects = async () => {
//     try {
//       const response = await teacherAPI.getSubjects();
//       setSubjects(response.data || []);
//     } catch (error) {
//       console.error('Failed to load subjects:', error);
//       toast.error('Failed to load subjects');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchClassesForSubject = async (subjectId) => {
//     if (classData[subjectId]) {
//       // Already fetched, just toggle
//       setExpandedSubject(expandedSubject === subjectId ? null : subjectId);
//       return;
//     }

//     try {
//       // FIXED: Use query parameter instead of path parameter
//       const response = await teacherAPI.getSubjectClasses(subjectId); // ← assuming this method is updated
//       // OR if teacherAPI.getSubjectClasses still uses old URL, replace with:
//       // const response = await axios.get('/api/teachers/subject-classes/', {
//       //   params: { subject_id: subjectId }
//       // });

//       setClassData(prev => ({
//         ...prev,
//         [subjectId]: response.data.classes || response.data || [] // safe fallback
//       }));
//       setExpandedSubject(subjectId);
//     } catch (error) {
//       console.error('Failed to load classes:', error);
//       toast.error('Failed to load classes for this subject');
//     }
//   };

//   const handleClassClick = async (subjectId, classId) => {
//     // Fetch chapters for this subject-class combination
//     try {
//       const response = await teacherAPI.getClassChapters(classId, subjectId);
//       const chapters = response.data || [];
      
//       if (chapters.length === 0) {
//         toast.error('No chapters found for this class. Please create chapters first.');
//         return;
//       }

//       // Navigate to chapter selection or directly to create test
//       navigate('/teacher/test/select-chapter', {
//         state: {
//           subjectId,
//           classId,
//           chapters
//         }
//       });
//     } catch (error) {
//       console.error('Failed to load chapters:', error);
//       toast.error('Failed to load chapters');
//     }
//   };

//   if (loading) return <Loading fullScreen />;

//   return (
//     <DashboardLayout>
//       <div className="p-6 max-w-6xl mx-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <div className="flex items-center space-x-4">
//             <Link to="/teacher/dashboard">
//               <Button variant="secondary" size="sm">
//                 <HiArrowLeft className="w-4 h-4 mr-2" />
//                 Back
//               </Button>
//             </Link>
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
//                 Create Test
//               </h1>
//               <p className="text-gray-600 dark:text-gray-400 mt-1">
//                 Select a subject and class to create a test
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Instructions */}
//         <Card className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 mb-6">
//           <div className="p-4">
//             <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
//               How to Create a Test:
//             </h3>
//             <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
//               <li>Select a subject you teach (click to expand)</li>
//               <li>Choose the class you want to create a test for</li>
//               <li>Select the chapter for this test</li>
//               <li>Fill in test details and add questions</li>
//             </ol>
//           </div>
//         </Card>

//         {/* Subjects List */}
//         {subjects.length === 0 ? (
//           <Card className="bg-white dark:bg-gray-800 p-12 text-center">
//             <HiAcademicCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
//               No Subjects Assigned
//             </h3>
//             <p className="text-gray-600 dark:text-gray-400">
//               You haven't been assigned to teach any subjects yet. Contact admin for assistance.
//             </p>
//           </Card>
//         ) : (
//           <div className="space-y-4">
//             {subjects.map((subject) => (
//               <Card key={subject.id} className="bg-white dark:bg-gray-800">
//                 <div>
//                   {/* Subject Header */}
//                   <button
//                     onClick={() => fetchClassesForSubject(subject.id)}
//                     className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
//                   >
//                     <div className="flex items-center space-x-4">
//                       <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
//                         <HiBookOpen className="w-6 h-6 text-blue-600 dark:text-blue-300" />
//                       </div>
//                       <div>
//                         <h3 className="text-lg font-bold text-gray-900 dark:text-white">
//                           {subject.name}
//                         </h3>
//                         <p className="text-sm text-gray-600 dark:text-gray-400">
//                           Click to view classes
//                         </p>
//                       </div>
//                     </div>
//                     <HiChevronRight 
//                       className={`w-6 h-6 text-gray-400 transition-transform ${
//                         expandedSubject === subject.id ? 'rotate-90' : ''
//                       }`}
//                     />
//                   </button>

//                   {/* Classes List (Expanded) */}
//                   {expandedSubject === subject.id && classData[subject.id] && (
//                     <div className="border-t border-gray-200 dark:border-gray-700">
//                       {classData[subject.id].length === 0 ? (
//                         <div className="p-6 text-center">
//                           <p className="text-gray-600 dark:text-gray-400">
//                             No classes assigned for this subject
//                           </p>
//                         </div>
//                       ) : (
//                         <div className="p-4 space-y-2">
//                           <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-2 mb-3">
//                             Select a class:
//                           </p>
//                           {classData[subject.id].map((classItem) => (
//                             <button
//                               key={classItem.class.id}
//                               onClick={() => handleClassClick(subject.id, classItem.class.id)}
//                               className="w-full p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-between group"
//                             >
//                               <div className="flex items-center space-x-3">
//                                 <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
//                                   <HiAcademicCap className="w-5 h-5 text-green-600 dark:text-green-300" />
//                                 </div>
//                                 <div className="text-left">
//                                   <h4 className="font-semibold text-gray-900 dark:text-white">
//                                     {classItem.class.name}
//                                   </h4>
//                                   <p className="text-sm text-gray-600 dark:text-gray-400">
//                                     {classItem.total_chapters || 0} chapters • {classItem.student_count || 0} students
//                                   </p>
//                                 </div>
//                               </div>
//                               <HiClipboardList className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
//                             </button>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </Card>
//             ))}
//           </div>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// };

// export default TeacherTestSelection;





















// // import { useState, useEffect } from 'react';
// // import { Link, useNavigate } from 'react-router-dom';
// // import { 
// //   HiArrowLeft, 
// //   HiAcademicCap, 
// //   HiBookOpen,
// //   HiChevronRight,
// //   HiClipboardList 
// // } from 'react-icons/hi';
// // import DashboardLayout from '../../components/layout/DashboardLayout';
// // import Card from '../../components/common/Card';
// // import Loading from '../../components/common/Loading';
// // import Button from '../../components/common/Button';
// // import { teacherAPI } from '../../services/api';
// // import toast from 'react-hot-toast';

// // const TeacherTestSelection = () => {
// //   const navigate = useNavigate();
// //   const [subjects, setSubjects] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [expandedSubject, setExpandedSubject] = useState(null);
// //   const [classData, setClassData] = useState({});

// //   useEffect(() => {
// //     fetchSubjects();
// //   }, []);

// //   const fetchSubjects = async () => {
// //     try {
// //       const response = await teacherAPI.getSubjects();
// //       setSubjects(response.data || []);
// //     } catch (error) {
// //       console.error('Failed to load subjects:', error);
// //       toast.error('Failed to load subjects');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const fetchClassesForSubject = async (subjectId) => {
// //     if (classData[subjectId]) {
// //       // Already fetched, just toggle
// //       setExpandedSubject(expandedSubject === subjectId ? null : subjectId);
// //       return;
// //     }

// //     try {
// //       const response = await teacherAPI.getSubjectClasses(subjectId);
// //       setClassData(prev => ({
// //         ...prev,
// //         [subjectId]: response.data.classes || []
// //       }));
// //       setExpandedSubject(subjectId);
// //     } catch (error) {
// //       console.error('Failed to load classes:', error);
// //       toast.error('Failed to load classes for this subject');
// //     }
// //   };

// //   const handleClassClick = async (subjectId, classId) => {
// //     // Fetch chapters for this subject-class combination
// //     try {
// //       const response = await teacherAPI.getClassChapters(classId, subjectId);
// //       const chapters = response.data || [];
      
// //       if (chapters.length === 0) {
// //         toast.error('No chapters found for this class. Please create chapters first.');
// //         return;
// //       }

// //       // Navigate to chapter selection or directly to create test
// //       navigate('/teacher/test/select-chapter', {
// //         state: {
// //           subjectId,
// //           classId,
// //           chapters
// //         }
// //       });
// //     } catch (error) {
// //       console.error('Failed to load chapters:', error);
// //       toast.error('Failed to load chapters');
// //     }
// //   };

// //   if (loading) return <Loading fullScreen />;

// //   return (
// //     <DashboardLayout>
// //       <div className="p-6 max-w-6xl mx-auto">
// //         {/* Header */}
// //         <div className="flex items-center justify-between mb-8">
// //           <div className="flex items-center space-x-4">
// //             <Link to="/teacher/dashboard">
// //               <Button variant="secondary" size="sm">
// //                 <HiArrowLeft className="w-4 h-4 mr-2" />
// //                 Back
// //               </Button>
// //             </Link>
// //             <div>
// //               <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
// //                 Create Test
// //               </h1>
// //               <p className="text-gray-600 dark:text-gray-400 mt-1">
// //                 Select a subject and class to create a test
// //               </p>
// //             </div>
// //           </div>
// //         </div>

// //         {/* Instructions */}
// //         <Card className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 mb-6">
// //           <div className="p-4">
// //             <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
// //               How to Create a Test:
// //             </h3>
// //             <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
// //               <li>Select a subject you teach (click to expand)</li>
// //               <li>Choose the class you want to create a test for</li>
// //               <li>Select the chapter for this test</li>
// //               <li>Fill in test details and add questions</li>
// //             </ol>
// //           </div>
// //         </Card>

// //         {/* Subjects List */}
// //         {subjects.length === 0 ? (
// //           <Card className="bg-white dark:bg-gray-800 p-12 text-center">
// //             <HiAcademicCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
// //             <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
// //               No Subjects Assigned
// //             </h3>
// //             <p className="text-gray-600 dark:text-gray-400">
// //               You haven't been assigned to teach any subjects yet. Contact admin for assistance.
// //             </p>
// //           </Card>
// //         ) : (
// //           <div className="space-y-4">
// //             {subjects.map((subject) => (
// //               <Card key={subject.id} className="bg-white dark:bg-gray-800">
// //                 <div>
// //                   {/* Subject Header */}
// //                   <button
// //                     onClick={() => fetchClassesForSubject(subject.id)}
// //                     className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
// //                   >
// //                     <div className="flex items-center space-x-4">
// //                       <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
// //                         <HiBookOpen className="w-6 h-6 text-blue-600 dark:text-blue-300" />
// //                       </div>
// //                       <div>
// //                         <h3 className="text-lg font-bold text-gray-900 dark:text-white">
// //                           {subject.name}
// //                         </h3>
// //                         <p className="text-sm text-gray-600 dark:text-gray-400">
// //                           Click to view classes
// //                         </p>
// //                       </div>
// //                     </div>
// //                     <HiChevronRight 
// //                       className={`w-6 h-6 text-gray-400 transition-transform ${
// //                         expandedSubject === subject.id ? 'rotate-90' : ''
// //                       }`}
// //                     />
// //                   </button>

// //                   {/* Classes List (Expanded) */}
// //                   {expandedSubject === subject.id && classData[subject.id] && (
// //                     <div className="border-t border-gray-200 dark:border-gray-700">
// //                       {classData[subject.id].length === 0 ? (
// //                         <div className="p-6 text-center">
// //                           <p className="text-gray-600 dark:text-gray-400">
// //                             No classes assigned for this subject
// //                           </p>
// //                         </div>
// //                       ) : (
// //                         <div className="p-4 space-y-2">
// //                           <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-2 mb-3">
// //                             Select a class:
// //                           </p>
// //                           {classData[subject.id].map((classItem) => (
// //                             <button
// //                               key={classItem.class.id}
// //                               onClick={() => handleClassClick(subject.id, classItem.class.id)}
// //                               className="w-full p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-between group"
// //                             >
// //                               <div className="flex items-center space-x-3">
// //                                 <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
// //                                   <HiAcademicCap className="w-5 h-5 text-green-600 dark:text-green-300" />
// //                                 </div>
// //                                 <div className="text-left">
// //                                   <h4 className="font-semibold text-gray-900 dark:text-white">
// //                                     {classItem.class.name}
// //                                   </h4>
// //                                   <p className="text-sm text-gray-600 dark:text-gray-400">
// //                                     {classItem.total_chapters || 0} chapters • {classItem.student_count || 0} students
// //                                   </p>
// //                                 </div>
// //                               </div>
// //                               <HiClipboardList className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
// //                             </button>
// //                           ))}
// //                         </div>
// //                       )}
// //                     </div>
// //                   )}
// //                 </div>
// //               </Card>
// //             ))}
// //           </div>
// //         )}
// //       </div>
// //     </DashboardLayout>
// //   );
// // };

// // export default TeacherTestSelection;