import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowLeft, HiQuestionMarkCircle, HiPlus, HiReply } from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { studentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const StudentDoubts = () => {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDoubt, setNewDoubt] = useState({ subject_id: '', text: '', image: null });
  const [subjects, setSubjects] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyImage, setReplyImage] = useState(null);

  useEffect(() => {
    // Fetch both doubts and subjects when the component loads
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([fetchDoubts(), fetchSubjects()]);
      setLoading(false);
    };
    loadInitialData();
  }, []);

  const fetchDoubts = async () => {
    try {
      const response = await studentAPI.getMyDoubts();
      setDoubts(response.data || []);
    } catch (error) {
      console.error('Failed to load doubts:', error);
      toast.error('Failed to load doubts');
    }
  };

  // Fetch subjects assigned to the student's class
  const fetchSubjects = async () => {
    try {
      const response = await studentAPI.getEnrolledSubjects();
      setSubjects(response.data || []);
    } catch (error) {
      console.error('Failed to load subjects:', error);
      toast.error('Failed to load subjects');
    }
  };

  const handleCreateDoubt = async (e) => {
    e.preventDefault();
    if (!newDoubt.subject_id) {
      toast.error('Please select a subject');
      return;
    }
    if (!newDoubt.text.trim()) {
      toast.error('Please enter your doubt');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('subject_id', newDoubt.subject_id);
      formData.append('text', newDoubt.text);
      if (newDoubt.image) {
        formData.append('image', newDoubt.image);
      }

      await studentAPI.createDoubt(formData);
      toast.success('Doubt posted successfully!');
      setShowCreateModal(false);
      setNewDoubt({ subject_id: '', text: '', image: null });
      fetchDoubts();
    } catch (error) {
      console.error('Failed to create doubt:', error);
      toast.error(error.response?.data?.error || 'Failed to post doubt');
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
      if (replyImage) {
        formData.append('image', replyImage);
      }

      await studentAPI.replyToDoubt(doubtId, formData);
      toast.success('Reply posted successfully!');
      setReplyingTo(null);
      setReplyText('');
      setReplyImage(null);
      fetchDoubts();
    } catch (error) {
      console.error('Failed to post reply:', error);
      toast.error('Failed to post reply');
    }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
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
                Doubts & Discussions
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Ask questions and collaborate with classmates and teachers
              </p>
            </div>
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <HiPlus className="w-5 h-5 mr-2" />
            Ask Doubt
          </Button>
        </div>

        {/* Doubts List */}
        {doubts.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 p-12 text-center">
            <HiQuestionMarkCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Doubts Posted Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ask your first doubt to get help from teachers and classmates
            </p>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <HiPlus className="w-5 h-5 mr-2" />
              Ask Your First Doubt
            </Button>
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
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          doubt.reply_count > 0
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                        }`}>
                          {doubt.reply_count > 0 ? `${doubt.reply_count} Replies` : 'Pending'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Asked by {doubt.student?.name || 'Student'} ({doubt.student?.unique_id})
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {doubt.text}
                      </p>
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

                  {/* Replies section */}
                  {doubt.replies && doubt.replies.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Replies:</h4>
                      {doubt.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <HiReply className="w-5 h-5 text-blue-500 mt-1" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                              {reply.user?.name} {reply.user?.role === 'teacher' && '(Teacher)'}
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">
                              {reply.text}
                            </p>
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
                          placeholder="Write your reply..."
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setReplyImage(e.target.files[0])}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                        />
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
                        variant="secondary"
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

        {/* Create Doubt Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setNewDoubt({ subject_id: '', text: '', image: null });
          }}
          title="Ask a Doubt"
        >
          <form onSubmit={handleCreateDoubt} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject *
              </label>
              <select
                value={newDoubt.subject_id}
                onChange={(e) => setNewDoubt({ ...newDoubt, subject_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Your doubt will be visible to your classmates and the assigned teacher for this subject
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Doubt *
              </label>
              <textarea
                value={newDoubt.text}
                onChange={(e) => setNewDoubt({ ...newDoubt, text: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                placeholder="Describe your doubt in detail..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Attach Image (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewDoubt({ ...newDoubt, image: e.target.files[0] })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="flex space-x-3">
              <Button type="submit" variant="primary" className="flex-1">
                Post Doubt
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewDoubt({ subject_id: '', text: '', image: null });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default StudentDoubts;
























// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { HiArrowLeft, HiQuestionMarkCircle, HiPlus, HiReply } from 'react-icons/hi';
// import DashboardLayout from '../../components/layout/DashboardLayout';
// import Card from '../../components/common/Card';
// import Loading from '../../components/common/Loading';
// import Button from '../../components/common/Button';
// import Modal from '../../components/common/Modal';
// import { studentAPI } from '../../services/api';
// import toast from 'react-hot-toast';

// const StudentDoubts = () => {
//   const [doubts, setDoubts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [newDoubt, setNewDoubt] = useState({ subject_id: '', text: '', image: null });
//   const [subjects, setSubjects] = useState([]); // This will now be populated

//   useEffect(() => {
//     // Fetch both doubts and subjects when the component loads
//     const loadInitialData = async () => {
//       setLoading(true);
//       await Promise.all([fetchDoubts(), fetchSubjects()]);
//       setLoading(false);
//     };
//     loadInitialData();
//   }, []);

//   const fetchDoubts = async () => {
//     try {
//       const response = await studentAPI.getMyDoubts();
//       setDoubts(response.data || []);
//     } catch (error) {
//       console.error('Failed to load doubts:', error);
//       toast.error('Failed to load doubts');
//     }
//   };

//   // NEW: Fetch subjects assigned to the student's class
//   const fetchSubjects = async () => {
//     try {
//       // Assuming your studentAPI has a method to get enrolled subjects
//       // If the method name is different in your api.js, update it here
//       const response = await studentAPI.getEnrolledSubjects(); 
//       setSubjects(response.data || []);
//     } catch (error) {
//       console.error('Failed to load subjects:', error);
//     }
//   };

//   const handleCreateDoubt = async (e) => {
//     e.preventDefault();
//     if (!newDoubt.subject_id) {
//       toast.error('Please select a subject');
//       return;
//     }
//     if (!newDoubt.text.trim()) {
//       toast.error('Please enter your doubt');
//       return;
//     }

//     try {
//       const formData = new FormData();
//       formData.append('subject_id', newDoubt.subject_id);
//       formData.append('text', newDoubt.text);
//       if (newDoubt.image) {
//         formData.append('image', newDoubt.image);
//       }

//       await studentAPI.createDoubt(formData);
//       toast.success('Doubt posted successfully!');
//       setShowCreateModal(false);
//       setNewDoubt({ subject_id: '', text: '', image: null });
//       fetchDoubts();
//     } catch (error) {
//       console.error('Failed to create doubt:', error);
//       toast.error('Failed to post doubt');
//     }
//   };

//   if (loading) return <Loading fullScreen />;

//   return (
//     <DashboardLayout>
//       <div className="p-6 max-w-6xl mx-auto">
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
//                 My Doubts
//               </h1>
//               <p className="text-gray-600 dark:text-gray-400 mt-1">
//                 Ask questions and get help from teachers
//               </p>
//             </div>
//           </div>
//           <Button variant="primary" onClick={() => setShowCreateModal(true)}>
//             <HiPlus className="w-5 h-5 mr-2" />
//             Ask Doubt
//           </Button>
//         </div>

//         {/* Doubts List */}
//         {doubts.length === 0 ? (
//           <Card className="bg-white dark:bg-gray-800 p-12 text-center">
//             <HiQuestionMarkCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
//               No Doubts Posted Yet
//             </h3>
//             <p className="text-gray-600 dark:text-gray-400 mb-6">
//               Ask your first doubt to get help from teachers
//             </p>
//             <Button variant="primary" onClick={() => setShowCreateModal(true)}>
//               <HiPlus className="w-5 h-5 mr-2" />
//               Ask Your First Doubt
//             </Button>
//           </Card>
//         ) : (
//           <div className="space-y-4">
//             {doubts.map((doubt) => (
//               <Card key={doubt.id} className="bg-white dark:bg-gray-800">
//                 <div className="p-6">
//                   <div className="flex items-start justify-between mb-4">
//                     <div className="flex-1">
//                       <div className="flex items-center space-x-3 mb-2">
//                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                           {doubt.subject_name || 'Subject'}
//                         </h3>
//                         <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                           doubt.replies_count > 0
//                             ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
//                             : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
//                         }`}>
//                           {doubt.replies_count > 0 ? `${doubt.replies_count} Replies` : 'Pending'}
//                         </span>
//                       </div>
//                       <p className="text-gray-700 dark:text-gray-300 mb-3">
//                         {doubt.text}
//                       </p>
//                       {doubt.image && (
//                         <img
//                           src={doubt.image}
//                           alt="Doubt"
//                           className="max-w-sm h-auto rounded-lg mb-3"
//                         />
//                       )}
//                       <p className="text-sm text-gray-500 dark:text-gray-400">
//                         Posted {new Date(doubt.created_at).toLocaleDateString()}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Replies section remains the same */}
//                   {doubt.replies && doubt.replies.length > 0 && (
//                     <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
//                       {doubt.replies.map((reply) => (
//                         <div key={reply.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
//                           <HiReply className="w-5 h-5 text-blue-500 mt-1" />
//                           <div className="flex-1">
//                             <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
//                               {reply.user_name} {reply.user_role === 'teacher' && '(Teacher)'}
//                             </p>
//                             <p className="text-gray-700 dark:text-gray-300">
//                               {reply.text}
//                             </p>
//                             {reply.image && (
//                               <img
//                                 src={reply.image}
//                                 alt="Reply"
//                                 className="max-w-xs h-auto rounded-lg mt-2"
//                               />
//                             )}
//                             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                               {new Date(reply.created_at).toLocaleDateString()}
//                             </p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </Card>
//             ))}
//           </div>
//         )}

//         {/* Create Doubt Modal */}
//         <Modal
//           isOpen={showCreateModal}
//           onClose={() => setShowCreateModal(false)}
//           title="Ask a Doubt"
//         >
//           <form onSubmit={handleCreateDoubt} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Subject *
//               </label>
//               <select
//                 value={newDoubt.subject_id}
//                 onChange={(e) => setNewDoubt({ ...newDoubt, subject_id: e.target.value })}
//                 className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
//                 required
//               >
//                 <option value="">Select Subject</option>
//                 {subjects.map((subject) => (
//                   <option key={subject.id} value={subject.id}>
//                     {subject.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Your Doubt *
//               </label>
//               <textarea
//                 value={newDoubt.text}
//                 onChange={(e) => setNewDoubt({ ...newDoubt, text: e.target.value })}
//                 rows={4}
//                 className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
//                 placeholder="Describe your doubt in detail..."
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Attach Image (Optional)
//               </label>
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => setNewDoubt({ ...newDoubt, image: e.target.files[0] })}
//                 className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
//               />
//             </div>

//             <div className="flex space-x-3">
//               <Button type="submit" variant="primary" className="flex-1">
//                 Post Doubt
//               </Button>
//               <Button
//                 type="button"
//                 variant="secondary"
//                 onClick={() => setShowCreateModal(false)}
//               >
//                 Cancel
//               </Button>
//             </div>
//           </form>
//         </Modal>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default StudentDoubts;






















// // import { useState, useEffect } from 'react';
// // import { Link } from 'react-router-dom';
// // import { HiArrowLeft, HiQuestionMarkCircle, HiPlus, HiReply } from 'react-icons/hi';
// // import DashboardLayout from '../../components/layout/DashboardLayout';
// // import Card from '../../components/common/Card';
// // import Loading from '../../components/common/Loading';
// // import Button from '../../components/common/Button';
// // import Modal from '../../components/common/Modal';
// // import { studentAPI } from '../../services/api';
// // import toast from 'react-hot-toast';

// // const StudentDoubts = () => {
// //   const [doubts, setDoubts] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [showCreateModal, setShowCreateModal] = useState(false);
// //   const [newDoubt, setNewDoubt] = useState({ subject_id: '', text: '', image: null });
// //   const [subjects, setSubjects] = useState([]);

// //   useEffect(() => {
// //     fetchDoubts();
// //   }, []);

// //   const fetchDoubts = async () => {
// //     try {
// //       const response = await studentAPI.getMyDoubts();
// //       setDoubts(response.data || []);
// //     } catch (error) {
// //       console.error('Failed to load doubts:', error);
// //       toast.error('Failed to load doubts');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleCreateDoubt = async (e) => {
// //     e.preventDefault();
// //     if (!newDoubt.text.trim()) {
// //       toast.error('Please enter your doubt');
// //       return;
// //     }

// //     try {
// //       const formData = new FormData();
// //       formData.append('subject_id', newDoubt.subject_id);
// //       formData.append('text', newDoubt.text);
// //       if (newDoubt.image) {
// //         formData.append('image', newDoubt.image);
// //       }

// //       await studentAPI.createDoubt(formData);
// //       toast.success('Doubt posted successfully!');
// //       setShowCreateModal(false);
// //       setNewDoubt({ subject_id: '', text: '', image: null });
// //       fetchDoubts();
// //     } catch (error) {
// //       console.error('Failed to create doubt:', error);
// //       toast.error('Failed to post doubt');
// //     }
// //   };

// //   if (loading) return <Loading fullScreen />;

// //   return (
// //     <DashboardLayout>
// //       <div className="p-6 max-w-6xl mx-auto">
// //         {/* Header */}
// //         <div className="flex items-center justify-between mb-8">
// //           <div className="flex items-center space-x-4">
// //             <Link to="/student/dashboard">
// //               <Button variant="secondary" size="sm">
// //                 <HiArrowLeft className="w-4 h-4 mr-2" />
// //                 Back
// //               </Button>
// //             </Link>
// //             <div>
// //               <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
// //                 My Doubts
// //               </h1>
// //               <p className="text-gray-600 dark:text-gray-400 mt-1">
// //                 Ask questions and get help from teachers
// //               </p>
// //             </div>
// //           </div>
// //           <Button variant="primary" onClick={() => setShowCreateModal(true)}>
// //             <HiPlus className="w-5 h-5 mr-2" />
// //             Ask Doubt
// //           </Button>
// //         </div>

// //         {/* Doubts List */}
// //         {doubts.length === 0 ? (
// //           <Card className="bg-white dark:bg-gray-800 p-12 text-center">
// //             <HiQuestionMarkCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
// //             <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
// //               No Doubts Posted Yet
// //             </h3>
// //             <p className="text-gray-600 dark:text-gray-400 mb-6">
// //               Ask your first doubt to get help from teachers
// //             </p>
// //             <Button variant="primary" onClick={() => setShowCreateModal(true)}>
// //               <HiPlus className="w-5 h-5 mr-2" />
// //               Ask Your First Doubt
// //             </Button>
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
// //                           {doubt.subject_name || 'Subject'}
// //                         </h3>
// //                         <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
// //                           doubt.replies_count > 0
// //                             ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
// //                             : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
// //                         }`}>
// //                           {doubt.replies_count > 0 ? `${doubt.replies_count} Replies` : 'Pending'}
// //                         </span>
// //                       </div>
// //                       <p className="text-gray-700 dark:text-gray-300 mb-3">
// //                         {doubt.text}
// //                       </p>
// //                       {doubt.image && (
// //                         <img
// //                           src={doubt.image}
// //                           alt="Doubt"
// //                           className="max-w-sm h-auto rounded-lg mb-3"
// //                         />
// //                       )}
// //                       <p className="text-sm text-gray-500 dark:text-gray-400">
// //                         Posted {new Date(doubt.created_at).toLocaleDateString()}
// //                       </p>
// //                     </div>
// //                   </div>

// //                   {/* Replies */}
// //                   {doubt.replies && doubt.replies.length > 0 && (
// //                     <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
// //                       {doubt.replies.map((reply) => (
// //                         <div key={reply.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
// //                           <HiReply className="w-5 h-5 text-blue-500 mt-1" />
// //                           <div className="flex-1">
// //                             <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
// //                               {reply.user_name} {reply.user_role === 'teacher' && '(Teacher)'}
// //                             </p>
// //                             <p className="text-gray-700 dark:text-gray-300">
// //                               {reply.text}
// //                             </p>
// //                             {reply.image && (
// //                               <img
// //                                 src={reply.image}
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
// //                 </div>
// //               </Card>
// //             ))}
// //           </div>
// //         )}

// //         {/* Create Doubt Modal */}
// //         <Modal
// //           isOpen={showCreateModal}
// //           onClose={() => setShowCreateModal(false)}
// //           title="Ask a Doubt"
// //         >
// //           <form onSubmit={handleCreateDoubt} className="space-y-4">
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                 Subject *
// //               </label>
// //               <select
// //                 value={newDoubt.subject_id}
// //                 onChange={(e) => setNewDoubt({ ...newDoubt, subject_id: e.target.value })}
// //                 className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
// //                 required
// //               >
// //                 <option value="">Select Subject</option>
// //                 {subjects.map((subject) => (
// //                   <option key={subject.id} value={subject.id}>
// //                     {subject.name}
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>

// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                 Your Doubt *
// //               </label>
// //               <textarea
// //                 value={newDoubt.text}
// //                 onChange={(e) => setNewDoubt({ ...newDoubt, text: e.target.value })}
// //                 rows={4}
// //                 className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
// //                 placeholder="Describe your doubt in detail..."
// //                 required
// //               />
// //             </div>

// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                 Attach Image (Optional)
// //               </label>
// //               <input
// //                 type="file"
// //                 accept="image/*"
// //                 onChange={(e) => setNewDoubt({ ...newDoubt, image: e.target.files[0] })}
// //                 className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
// //               />
// //             </div>

// //             <div className="flex space-x-3">
// //               <Button type="submit" variant="primary" className="flex-1">
// //                 Post Doubt
// //               </Button>
// //               <Button
// //                 type="button"
// //                 variant="secondary"
// //                 onClick={() => setShowCreateModal(false)}
// //               >
// //                 Cancel
// //               </Button>
// //             </div>
// //           </form>
// //         </Modal>
// //       </div>
// //     </DashboardLayout>
// //   );
// // };

// // export default StudentDoubts;























// // // import DashboardLayout from '../../components/layout/DashboardLayout';
// // // export default function StudentDoubts() {
// // //   return (
// // //     <DashboardLayout>
// // //       <div className="p-6">
// // //         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Doubts - Coming Soon</h1>
// // //       </div>
// // //     </DashboardLayout>
// // //   );
// // // }