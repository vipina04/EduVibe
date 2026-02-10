import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowLeft, HiQuestionMarkCircle, HiReply, HiFilter } from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { teacherAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TeacherDoubts = () => {
  const [doubts, setDoubts] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyImage, setReplyImage] = useState(null);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchClasses();
      setLoading(false);
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSubjects(selectedClass);
      fetchDoubts(selectedClass, selectedSubject);
    } else {
      setSubjects([]);
      setDoubts([]);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass) {
      fetchDoubts(selectedClass, selectedSubject);
    }
  }, [selectedSubject]);

  // Fetch classes assigned to teacher
  const fetchClasses = async () => {
    try {
      console.log('🔄 Fetching teacher classes...');
      const response = await teacherAPI.getClasses(); // new API: returns classes assigned to teacher
      console.log('✅ Classes data:', response.data);
      setClasses(response.data || []);
    } catch (error) {
      console.error('❌ Failed to load classes:', error);
      toast.error('Failed to load classes');
    }
  };

  // Fetch subjects of a particular class assigned to teacher
  const fetchSubjects = async (classId) => {
    try {
      console.log(`🔄 Fetching subjects for class ${classId}...`);
      const response = await teacherAPI.getSubjects({ class_id: classId });
      console.log('✅ Subjects data:', response.data);
      setSubjects(response.data || []);
    } catch (error) {
      console.error('❌ Failed to load subjects:', error);
      toast.error('Failed to load subjects');
    }
  };

  // Fetch doubts with optional class and subject filters
  const fetchDoubts = async (classId, subjectId) => {
    try {
      console.log('🔄 Fetching doubts...', classId, subjectId);
      const params = {};
      if (classId) params.class_id = classId;
      if (subjectId) params.subject_id = subjectId;

      const response = await teacherAPI.getDoubts(params);
      console.log('✅ Doubts data:', response.data);
      setDoubts(response.data || []);
    } catch (error) {
      console.error('❌ Failed to load doubts:', error);
      toast.error('Failed to load doubts');
    }
  };

  const handleReplySubmit = async (doubtId) => {
    if (!replyText.trim() && !replyImage) {
      toast.error('Please enter a reply or attach an image');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('text', replyText);
      if (replyImage) formData.append('image', replyImage);

      await teacherAPI.replyToDoubt(doubtId, formData);
      toast.success('Reply posted successfully!');
      setReplyingTo(null);
      setReplyText('');
      setReplyImage(null);
      fetchDoubts(selectedClass, selectedSubject);
    } catch (error) {
      console.error('❌ Failed to post reply:', error);
      toast.error(error.response?.data?.error || 'Failed to post reply');
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
                Student Doubts
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                View and respond to student queries for your subjects
              </p>
            </div>
          </div>

          {/* Class & Subject Filter */}
          <div className="flex items-center space-x-3">
            <HiFilter className="w-5 h-5 text-gray-500 dark:text-gray-400" />

            {/* Class Selection */}
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSubject('');
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>

            {/* Subject Selection */}
            {subjects.length > 0 && (
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Messages */}
        {classes.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 p-12 text-center">
            <HiQuestionMarkCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Classes Assigned
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You haven't been assigned to any class yet. Contact admin to get class assignments.
            </p>
          </Card>
        ) : selectedClass && subjects.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 p-12 text-center">
            <HiQuestionMarkCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Subjects Assigned
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No subjects are assigned in this class yet.
            </p>
          </Card>
        ) : doubts.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 p-12 text-center">
            <HiQuestionMarkCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Doubts Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedSubject
                ? 'No doubts have been posted for this subject yet.'
                : 'Students haven\'t posted any doubts yet.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {doubts.map((doubt) => (
              <Card key={doubt.id} className="bg-white dark:bg-gray-800">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {doubt.subject?.name || 'Subject'}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            doubt.reply_count > 0
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                          }`}
                        >
                          {doubt.reply_count > 0 ? `${doubt.reply_count} Replies` : 'Pending'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Asked by {doubt.student?.name || 'Student'} ({doubt.student?.unique_id})
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{doubt.text}</p>
                      {doubt.image_url && (
                        <img
                          src={doubt.image_url}
                          alt="Doubt"
                          className="max-w-sm h-auto rounded-lg mb-3"
                        />
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Posted {new Date(doubt.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Existing Replies */}
                  {doubt.replies && doubt.replies.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Replies:</h4>
                      {doubt.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                        >
                          <HiReply className="w-5 h-5 text-blue-500 mt-1" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                              {reply.user?.name}{' '}
                              {reply.user?.role === 'teacher' && (
                                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded text-xs">
                                  Teacher
                                </span>
                              )}
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">{reply.text}</p>
                            {reply.image_url && (
                              <img
                                src={reply.image_url}
                                alt="Reply"
                                className="max-w-xs h-auto rounded-lg mt-2"
                              />
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(reply.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Form */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {replyingTo === doubt.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                          placeholder="Write your reply to help the student..."
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Attach Image (Optional)
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setReplyImage(e.target.files[0])}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                        <div className="flex space-x-3">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleReplySubmit(doubt.id)}
                          >
                            Post Reply
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                              setReplyImage(null);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setReplyingTo(doubt.id)}
                      >
                        <HiReply className="w-4 h-4 mr-2" />
                        Reply to this doubt
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherDoubts;






















// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { HiArrowLeft, HiQuestionMarkCircle, HiReply, HiFilter } from 'react-icons/hi';
// import DashboardLayout from '../../components/layout/DashboardLayout';
// import Card from '../../components/common/Card';
// import Loading from '../../components/common/Loading';
// import Button from '../../components/common/Button';
// import { teacherAPI } from '../../services/api';
// import toast from 'react-hot-toast';

// const TeacherDoubts = () => {
//   const [doubts, setDoubts] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedSubject, setSelectedSubject] = useState('');
//   const [replyingTo, setReplyingTo] = useState(null);
//   const [replyText, setReplyText] = useState('');
//   const [replyImage, setReplyImage] = useState(null);

//   useEffect(() => {
//     const loadInitialData = async () => {
//       setLoading(true);
//       await fetchSubjects();
//       setLoading(false);
//     };
//     loadInitialData();
//   }, []);

//   useEffect(() => {
//     if (selectedSubject) {
//       fetchDoubts();
//     } else {
//       setDoubts([]); // Clear doubts if no subject is selected
//     }
//   }, [selectedSubject]);

//   const fetchSubjects = async () => {
//     try {
//       console.log('🔄 Fetching teacher subjects...');
//       const response = await teacherAPI.getSubjects();
//       console.log('✅ Subjects data:', response.data);
//       setSubjects(response.data || []);
//     } catch (error) {
//       console.error('❌ Failed to load subjects:', error);
//       toast.error('Failed to load subjects');
//     }
//   };

//   const fetchDoubts = async () => {
//     try {
//       console.log('🔄 Fetching doubts for subject:', selectedSubject);
//       const params = { subject_id: selectedSubject };
//       const response = await teacherAPI.getDoubts(params);
//       console.log('✅ Doubts data:', response.data);
//       setDoubts(response.data || []);
//     } catch (error) {
//       console.error('❌ Failed to load doubts:', error);
//       toast.error('Failed to load doubts');
//     }
//   };

//   const handleReplySubmit = async (doubtId) => {
//     if (!replyText.trim() && !replyImage) {
//       toast.error('Please enter a reply or attach an image');
//       return;
//     }

//     try {
//       const formData = new FormData();
//       formData.append('text', replyText);
//       if (replyImage) {
//         formData.append('image', replyImage);
//       }

//       await teacherAPI.replyToDoubt(doubtId, formData);
//       toast.success('Reply posted successfully!');
//       setReplyingTo(null);
//       setReplyText('');
//       setReplyImage(null);
//       fetchDoubts();
//     } catch (error) {
//       console.error('Failed to post reply:', error);
//       toast.error(error.response?.data?.error || 'Failed to post reply');
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
//                 Student Doubts
//               </h1>
//               <p className="text-gray-600 dark:text-gray-400 mt-1">
//                 View and respond to student queries for your subjects
//               </p>
//             </div>
//           </div>

//           {/* Subject Filter */}
//           {subjects.length > 0 && (
//             <div className="flex items-center space-x-3">
//               <HiFilter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
//               <select
//                 value={selectedSubject}
//                 onChange={(e) => setSelectedSubject(e.target.value)}
//                 className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
//               >
//                 <option value="">Select Subject</option>
//                 {subjects.map((subject) => (
//                   <option key={subject.id} value={subject.id}>
//                     {subject.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}
//         </div>

//         {/* No subjects assigned message */}
//         {subjects.length === 0 ? (
//           <Card className="bg-white dark:bg-gray-800 p-12 text-center">
//             <HiQuestionMarkCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
//               No Subjects Assigned
//             </h3>
//             <p className="text-gray-600 dark:text-gray-400">
//               You haven't been assigned to teach any subjects yet. Contact admin to get subject assignments.
//             </p>
//           </Card>
//         ) : !selectedSubject ? (
//           // Prompt to select a subject
//           <Card className="bg-white dark:bg-gray-800 p-12 text-center">
//             <HiQuestionMarkCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
//               Select a Subject
//             </h3>
//             <p className="text-gray-600 dark:text-gray-400">
//               Please select a subject from the dropdown above to view student doubts.
//             </p>
//           </Card>
//         ) : doubts.length === 0 ? (
//           <Card className="bg-white dark:bg-gray-800 p-12 text-center">
//             <HiQuestionMarkCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
//               No Doubts Yet
//             </h3>
//             <p className="text-gray-600 dark:text-gray-400">
//               No doubts have been posted for this subject yet.
//             </p>
//           </Card>
//         ) : (
//           <div className="space-y-4">
//             {doubts.map((doubt) => (
//               <Card key={doubt.id} className="bg-white dark:bg-gray-800">
//                 {/* ...existing doubt display code stays unchanged */}
//               </Card>
//             ))}
//           </div>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// };

// export default TeacherDoubts;














// // import { useState, useEffect } from 'react';
// // import { Link } from 'react-router-dom';
// // import { HiArrowLeft, HiQuestionMarkCircle, HiReply, HiFilter } from 'react-icons/hi';
// // import DashboardLayout from '../../components/layout/DashboardLayout';
// // import Card from '../../components/common/Card';
// // import Loading from '../../components/common/Loading';
// // import Button from '../../components/common/Button';
// // import { teacherAPI } from '../../services/api';
// // import toast from 'react-hot-toast';

// // const TeacherDoubts = () => {
// //   const [doubts, setDoubts] = useState([]);
// //   const [subjects, setSubjects] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [selectedSubject, setSelectedSubject] = useState('');
// //   const [replyingTo, setReplyingTo] = useState(null);
// //   const [replyText, setReplyText] = useState('');
// //   const [replyImage, setReplyImage] = useState(null);

// //   useEffect(() => {
// //     const loadInitialData = async () => {
// //       setLoading(true);
// //       await Promise.all([fetchSubjects(), fetchDoubts()]);
// //       setLoading(false);
// //     };
// //     loadInitialData();
// //   }, []);

// //   useEffect(() => {
// //     if (!loading) {
// //       fetchDoubts();
// //     }
// //   }, [selectedSubject]);

// //   const fetchSubjects = async () => {
// //     try {
// //       console.log('🔄 Fetching teacher subjects...');
// //       const response = await teacherAPI.getSubjects();
// //       console.log('✅ Subjects data:', response.data);
// //       setSubjects(response.data || []);
// //     } catch (error) {
// //       console.error('❌ Failed to load subjects:', error);
// //       console.error('Error details:', error.response);
// //       toast.error('Failed to load subjects');
// //     }
// //   };

// //   const fetchDoubts = async () => {
// //     try {
// //       console.log('🔄 Fetching doubts...', selectedSubject ? `for subject ${selectedSubject}` : 'all subjects');
// //       const params = selectedSubject ? { subject_id: selectedSubject } : {};
// //       const response = await teacherAPI.getDoubts(params);
// //       console.log('✅ Doubts data:', response.data);
// //       setDoubts(response.data || []);
// //     } catch (error) {
// //       console.error('❌ Failed to load doubts:', error);
// //       console.error('Error details:', error.response);
// //       toast.error('Failed to load doubts');
// //     }
// //   };

// //   const handleReplySubmit = async (doubtId) => {
// //     if (!replyText.trim() && !replyImage) {
// //       toast.error('Please enter a reply or attach an image');
// //       return;
// //     }

// //     try {
// //       const formData = new FormData();
// //       formData.append('text', replyText);
// //       if (replyImage) {
// //         formData.append('image', replyImage);
// //       }

// //       await teacherAPI.replyToDoubt(doubtId, formData);
// //       toast.success('Reply posted successfully!');
// //       setReplyingTo(null);
// //       setReplyText('');
// //       setReplyImage(null);
// //       fetchDoubts();
// //     } catch (error) {
// //       console.error('Failed to post reply:', error);
// //       toast.error(error.response?.data?.error || 'Failed to post reply');
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
// //                 Student Doubts
// //               </h1>
// //               <p className="text-gray-600 dark:text-gray-400 mt-1">
// //                 View and respond to student queries for your subjects
// //               </p>
// //             </div>
// //           </div>

// //           {/* Subject Filter */}
// //           {subjects.length > 0 && (
// //             <div className="flex items-center space-x-3">
// //               <HiFilter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
// //               <select
// //                 value={selectedSubject}
// //                 onChange={(e) => setSelectedSubject(e.target.value)}
// //                 className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
// //               >
// //                 <option value="">All Subjects</option>
// //                 {subjects.map((subject) => (
// //                   <option key={subject.id} value={subject.id}>
// //                     {subject.name}
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>
// //           )}
// //         </div>

// //         {/* No subjects assigned message */}
// //         {subjects.length === 0 ? (
// //           <Card className="bg-white dark:bg-gray-800 p-12 text-center">
// //             <HiQuestionMarkCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
// //             <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
// //               No Subjects Assigned
// //             </h3>
// //             <p className="text-gray-600 dark:text-gray-400">
// //               You haven't been assigned to teach any subjects yet. Contact admin to get subject assignments.
// //             </p>
// //           </Card>
// //         ) : doubts.length === 0 ? (
// //           <Card className="bg-white dark:bg-gray-800 p-12 text-center">
// //             <HiQuestionMarkCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
// //             <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
// //               No Doubts Yet
// //             </h3>
// //             <p className="text-gray-600 dark:text-gray-400">
// //               {selectedSubject 
// //                 ? 'No doubts have been posted for this subject yet.'
// //                 : 'Students haven\'t posted any doubts yet.'}
// //             </p>
// //           </Card>
// //         ) : (
// //           <div className="space-y-4">
// //             {doubts.map((doubt) => (
// //               <Card key={doubt.id} className="bg-white dark:bg-gray-800">
// //                 <div className="p-6">
// //                   <div className="flex items-start justify-between mb-4">
// //                     <div className="flex-1">
// //                       <div className="flex items-center space-x-3 mb-2">
// //                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
// //                           {doubt.subject?.name || 'Subject'}
// //                         </h3>
// //                         <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
// //                           doubt.reply_count > 0
// //                             ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
// //                             : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
// //                         }`}>
// //                           {doubt.reply_count > 0 ? `${doubt.reply_count} Replies` : 'Pending'}
// //                         </span>
// //                       </div>
// //                       <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
// //                         Asked by {doubt.student?.name || 'Student'} ({doubt.student?.unique_id})
// //                       </p>
// //                       <p className="text-gray-700 dark:text-gray-300 mb-3">
// //                         {doubt.text}
// //                       </p>
// //                       {doubt.image_url && (
// //                         <img
// //                           src={doubt.image_url}
// //                           alt="Doubt"
// //                           className="max-w-sm h-auto rounded-lg mb-3"
// //                         />
// //                       )}
// //                       <p className="text-sm text-gray-500 dark:text-gray-400">
// //                         Posted {new Date(doubt.created_at).toLocaleDateString()}
// //                       </p>
// //                     </div>
// //                   </div>

// //                   {/* Existing Replies */}
// //                   {doubt.replies && doubt.replies.length > 0 && (
// //                     <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
// //                       <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Replies:</h4>
// //                       {doubt.replies.map((reply) => (
// //                         <div key={reply.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
// //                           <HiReply className="w-5 h-5 text-blue-500 mt-1" />
// //                           <div className="flex-1">
// //                             <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
// //                               {reply.user?.name} 
// //                               {reply.user?.role === 'teacher' && (
// //                                 <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded text-xs">
// //                                   Teacher
// //                                 </span>
// //                               )}
// //                             </p>
// //                             <p className="text-gray-700 dark:text-gray-300">
// //                               {reply.text}
// //                             </p>
// //                             {reply.image_url && (
// //                               <img
// //                                 src={reply.image_url}
// //                                 alt="Reply"
// //                                 className="max-w-xs h-auto rounded-lg mt-2"
// //                               />
// //                             )}
// //                             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
// //                               {new Date(reply.created_at).toLocaleDateString()}
// //                             </p>
// //                           </div>
// //                         </div>
// //                       ))}
// //                     </div>
// //                   )}

// //                   {/* Reply Form */}
// //                   <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
// //                     {replyingTo === doubt.id ? (
// //                       <div className="space-y-3">
// //                         <textarea
// //                           value={replyText}
// //                           onChange={(e) => setReplyText(e.target.value)}
// //                           rows={3}
// //                           className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
// //                           placeholder="Write your reply to help the student..."
// //                         />
// //                         <div>
// //                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                             Attach Image (Optional)
// //                           </label>
// //                           <input
// //                             type="file"
// //                             accept="image/*"
// //                             onChange={(e) => setReplyImage(e.target.files[0])}
// //                             className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
// //                           />
// //                         </div>
// //                         <div className="flex space-x-3">
// //                           <Button
// //                             variant="primary"
// //                             size="sm"
// //                             onClick={() => handleReplySubmit(doubt.id)}
// //                           >
// //                             Post Reply
// //                           </Button>
// //                           <Button
// //                             variant="secondary"
// //                             size="sm"
// //                             onClick={() => {
// //                               setReplyingTo(null);
// //                               setReplyText('');
// //                               setReplyImage(null);
// //                             }}
// //                           >
// //                             Cancel
// //                           </Button>
// //                         </div>
// //                       </div>
// //                     ) : (
// //                       <Button
// //                         variant="primary"
// //                         size="sm"
// //                         onClick={() => setReplyingTo(doubt.id)}
// //                       >
// //                         <HiReply className="w-4 h-4 mr-2" />
// //                         Reply to this doubt
// //                       </Button>
// //                     )}
// //                   </div>
// //                 </div>
// //               </Card>
// //             ))}
// //           </div>
// //         )}
// //       </div>
// //     </DashboardLayout>
// //   );
// // };

// // export default TeacherDoubts;


















// // // import { useState, useEffect } from 'react';
// // // import { Link } from 'react-router-dom';
// // // import { HiArrowLeft, HiQuestionMarkCircle, HiReply, HiFilter } from 'react-icons/hi';
// // // import DashboardLayout from '../../components/layout/DashboardLayout';
// // // import Card from '../../components/common/Card';
// // // import Loading from '../../components/common/Loading';
// // // import Button from '../../components/common/Button';
// // // import { teacherAPI } from '../../services/api';
// // // import toast from 'react-hot-toast';

// // // const TeacherDoubts = () => {
// // //   const [doubts, setDoubts] = useState([]);
// // //   const [subjects, setSubjects] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [selectedSubject, setSelectedSubject] = useState('');
// // //   const [replyingTo, setReplyingTo] = useState(null);
// // //   const [replyText, setReplyText] = useState('');
// // //   const [replyImage, setReplyImage] = useState(null);

// // //   useEffect(() => {
// // //     const loadInitialData = async () => {
// // //       setLoading(true);
// // //       await Promise.all([fetchSubjects(), fetchDoubts()]);
// // //       setLoading(false);
// // //     };
// // //     loadInitialData();
// // //   }, []);

// // //   useEffect(() => {
// // //     if (!loading) {
// // //       fetchDoubts();
// // //     }
// // //   }, [selectedSubject]);

// // //   const fetchSubjects = async () => {
// // //     try {
// // //       const response = await teacherAPI.getSubjects();
// // //       setSubjects(response.data || []);
// // //     } catch (error) {
// // //       console.error('Failed to load subjects:', error);
// // //       toast.error('Failed to load subjects');
// // //     }
// // //   };

// // //   const fetchDoubts = async () => {
// // //     try {
// // //       const params = selectedSubject ? { subject_id: selectedSubject } : {};
// // //       const response = await teacherAPI.getDoubts(params);
// // //       setDoubts(response.data || []);
// // //     } catch (error) {
// // //       console.error('Failed to load doubts:', error);
// // //       toast.error('Failed to load doubts');
// // //     }
// // //   };

// // //   const handleReplySubmit = async (doubtId) => {
// // //     if (!replyText.trim() && !replyImage) {
// // //       toast.error('Please enter a reply or attach an image');
// // //       return;
// // //     }

// // //     try {
// // //       const formData = new FormData();
// // //       formData.append('text', replyText);
// // //       if (replyImage) {
// // //         formData.append('image', replyImage);
// // //       }

// // //       await teacherAPI.replyToDoubt(doubtId, formData);
// // //       toast.success('Reply posted successfully!');
// // //       setReplyingTo(null);
// // //       setReplyText('');
// // //       setReplyImage(null);
// // //       fetchDoubts();
// // //     } catch (error) {
// // //       console.error('Failed to post reply:', error);
// // //       toast.error('Failed to post reply');
// // //     }
// // //   };

// // //   const getDoubtDetail = async (doubtId) => {
// // //     try {
// // //       const response = await teacherAPI.getDoubtDetail(doubtId);
// // //       return response.data;
// // //     } catch (error) {
// // //       console.error('Failed to load doubt details:', error);
// // //       return null;
// // //     }
// // //   };

// // //   if (loading) return <Loading fullScreen />;

// // //   return (
// // //     <DashboardLayout>
// // //       <div className="p-6 max-w-6xl mx-auto">
// // //         {/* Header */}
// // //         <div className="flex items-center justify-between mb-8">
// // //           <div className="flex items-center space-x-4">
// // //             <Link to="/teacher/dashboard">
// // //               <Button variant="secondary" size="sm">
// // //                 <HiArrowLeft className="w-4 h-4 mr-2" />
// // //                 Back
// // //               </Button>
// // //             </Link>
// // //             <div>
// // //               <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
// // //                 Student Doubts
// // //               </h1>
// // //               <p className="text-gray-600 dark:text-gray-400 mt-1">
// // //                 View and respond to student queries
// // //               </p>
// // //             </div>
// // //           </div>

// // //           {/* Subject Filter */}
// // //           <div className="flex items-center space-x-3">
// // //             <HiFilter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
// // //             <select
// // //               value={selectedSubject}
// // //               onChange={(e) => setSelectedSubject(e.target.value)}
// // //               className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
// // //             >
// // //               <option value="">All Subjects</option>
// // //               {subjects.map((subject) => (
// // //                 <option key={subject.id} value={subject.id}>
// // //                   {subject.name}
// // //                 </option>
// // //               ))}
// // //             </select>
// // //           </div>
// // //         </div>

// // //         {/* Doubts List */}
// // //         {doubts.length === 0 ? (
// // //           <Card className="bg-white dark:bg-gray-800 p-12 text-center">
// // //             <HiQuestionMarkCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
// // //             <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
// // //               No Doubts Yet
// // //             </h3>
// // //             <p className="text-gray-600 dark:text-gray-400">
// // //               {selectedSubject 
// // //                 ? 'No doubts have been posted for this subject yet.'
// // //                 : 'Students haven\'t posted any doubts yet.'}
// // //             </p>
// // //           </Card>
// // //         ) : (
// // //           <div className="space-y-4">
// // //             {doubts.map((doubt) => (
// // //               <Card key={doubt.id} className="bg-white dark:bg-gray-800">
// // //                 <div className="p-6">
// // //                   <div className="flex items-start justify-between mb-4">
// // //                     <div className="flex-1">
// // //                       <div className="flex items-center space-x-3 mb-2">
// // //                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
// // //                           {doubt.subject?.name || 'Subject'}
// // //                         </h3>
// // //                         <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
// // //                           doubt.replies_count > 0
// // //                             ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
// // //                             : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
// // //                         }`}>
// // //                           {doubt.replies_count > 0 ? `${doubt.replies_count} Replies` : 'Pending'}
// // //                         </span>
// // //                       </div>
// // //                       <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
// // //                         Asked by {doubt.student?.name || 'Student'} ({doubt.student?.unique_id})
// // //                       </p>
// // //                       <p className="text-gray-700 dark:text-gray-300 mb-3">
// // //                         {doubt.text}
// // //                       </p>
// // //                       {doubt.image_url && (
// // //                         <img
// // //                           src={doubt.image_url}
// // //                           alt="Doubt"
// // //                           className="max-w-sm h-auto rounded-lg mb-3"
// // //                         />
// // //                       )}
// // //                       <p className="text-sm text-gray-500 dark:text-gray-400">
// // //                         Posted {new Date(doubt.created_at).toLocaleDateString()}
// // //                       </p>
// // //                     </div>
// // //                   </div>

// // //                   {/* Reply Section */}
// // //                   <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
// // //                     {replyingTo === doubt.id ? (
// // //                       <div className="space-y-3">
// // //                         <textarea
// // //                           value={replyText}
// // //                           onChange={(e) => setReplyText(e.target.value)}
// // //                           rows={3}
// // //                           className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
// // //                           placeholder="Write your reply to help the student..."
// // //                         />
// // //                         <input
// // //                           type="file"
// // //                           accept="image/*"
// // //                           onChange={(e) => setReplyImage(e.target.files[0])}
// // //                           className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
// // //                         />
// // //                         <div className="flex space-x-3">
// // //                           <Button
// // //                             variant="primary"
// // //                             size="sm"
// // //                             onClick={() => handleReplySubmit(doubt.id)}
// // //                           >
// // //                             Post Reply
// // //                           </Button>
// // //                           <Button
// // //                             variant="secondary"
// // //                             size="sm"
// // //                             onClick={() => {
// // //                               setReplyingTo(null);
// // //                               setReplyText('');
// // //                               setReplyImage(null);
// // //                             }}
// // //                           >
// // //                             Cancel
// // //                           </Button>
// // //                         </div>
// // //                       </div>
// // //                     ) : (
// // //                       <Button
// // //                         variant="primary"
// // //                         size="sm"
// // //                         onClick={() => setReplyingTo(doubt.id)}
// // //                       >
// // //                         <HiReply className="w-4 h-4 mr-2" />
// // //                         Reply to this doubt
// // //                       </Button>
// // //                     )}
// // //                   </div>
// // //                 </div>
// // //               </Card>
// // //             ))}
// // //           </div>
// // //         )}
// // //       </div>
// // //     </DashboardLayout>
// // //   );
// // // };

// // // export default TeacherDoubts;























// // // // import { useState, useEffect } from 'react';
// // // // import { useParams, Link } from 'react-router-dom';
// // // // import { HiArrowLeft, HiAcademicCap } from 'react-icons/hi';
// // // // import DashboardLayout from '../../components/layout/DashboardLayout';
// // // // import Card from '../../components/common/Card';
// // // // import Loading from '../../components/common/Loading';
// // // // import Button from '../../components/common/Button';
// // // // import { teacherAPI } from '../../services/api';
// // // // import toast from 'react-hot-toast';

// // // // const TeacherSubjectClasses = () => {
// // // //   const { subjectId } = useParams();
// // // //   const [data, setData] = useState(null);
// // // //   const [loading, setLoading] = useState(true);

// // // //   useEffect(() => {
// // // //     fetchSubjectClasses();
// // // //   }, [subjectId]);

// // // //   const fetchSubjectClasses = async () => {
// // // //     try {
// // // //       const response = await teacherAPI.getSubjectClasses(subjectId);
// // // //       setData(response.data);
// // // //     } catch (error) {
// // // //       console.error('Failed to load classes:', error);
// // // //       toast.error('Failed to load classes');
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
// // // //           <Link to="/teacher/dashboard">
// // // //             <Button variant="secondary" size="sm">
// // // //               <HiArrowLeft className="w-4 h-4 mr-2" />
// // // //               Back
// // // //             </Button>
// // // //           </Link>
// // // //           <div>
// // // //             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
// // // //               {data?.subject?.name || 'Subject'} - Classes
// // // //             </h1>
// // // //             <p className="text-gray-600 dark:text-gray-400 mt-1">
// // // //               Select a class to view chapters and create tests
// // // //             </p>
// // // //           </div>
// // // //         </div>

// // // //         {/* Classes Grid */}
// // // //         {data?.classes && data.classes.length === 0 ? (
// // // //           <Card className="bg-white dark:bg-gray-800 p-12 text-center">
// // // //             <HiAcademicCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
// // // //             <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
// // // //               No Classes Assigned
// // // //             </h3>
// // // //             <p className="text-gray-600 dark:text-gray-400">
// // // //               You haven't been assigned to teach this subject in any class yet.
// // // //             </p>
// // // //           </Card>
// // // //         ) : (
// // // //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// // // //             {data?.classes?.map((classItem) => (
// // // //               <Link 
// // // //                 key={classItem.id}
// // // //                 to={`/teacher/class/${classItem.id}/subject/${subjectId}/chapters`}
// // // //               >
// // // //                 <Card className="bg-white dark:bg-gray-800 hover:shadow-xl transition-all cursor-pointer">
// // // //                   <div className="p-6">
// // // //                     <div className="flex items-center justify-between mb-4">
// // // //                       <HiAcademicCap className="w-12 h-12 text-blue-600" />
// // // //                       <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-full text-sm font-semibold">
// // // //                         {classItem.students_count || 0} Students
// // // //                       </span>
// // // //                     </div>
// // // //                     <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
// // // //                       {classItem.name}
// // // //                     </h3>
// // // //                     <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
// // // //                       <div>
// // // //                         <p className="text-gray-500 dark:text-gray-400">Chapters</p>
// // // //                         <p className="text-gray-900 dark:text-white font-semibold">
// // // //                           {classItem.chapters_count || 0}
// // // //                         </p>
// // // //                       </div>
// // // //                       <div>
// // // //                         <p className="text-gray-500 dark:text-gray-400">Tests</p>
// // // //                         <p className="text-gray-900 dark:text-white font-semibold">
// // // //                           {classItem.tests_count || 0}
// // // //                         </p>
// // // //                       </div>
// // // //                     </div>
// // // //                   </div>
// // // //                 </Card>
// // // //               </Link>
// // // //             ))}
// // // //           </div>
// // // //         )}
// // // //       </div>
// // // //     </DashboardLayout>
// // // //   );
// // // // };

// // // // export default TeacherSubjectClasses;


























// // // // // import DashboardLayout from '../../components/layout/DashboardLayout';
// // // // // export default function TeacherDoubts() {
// // // // //   return (
// // // // //     <DashboardLayout>
// // // // //       <div className="p-6">
// // // // //         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Doubts - Coming Soon</h1>
// // // // //       </div>
// // // // //     </DashboardLayout>
// // // // //   );
// // // // // }