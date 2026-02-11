import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiArrowLeft, 
  HiUserAdd, 
  HiAcademicCap, 
  HiUserGroup, 
  HiTrash,
  HiSearch,
  HiFilter
} from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ManageTeacherAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('');
  
  const [newAssignment, setNewAssignment] = useState({
    teacher_id: '',
    subject_id: '',
    class_id: ''
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchAssignments(),
      fetchTeachers(),
      fetchSubjects(),
      fetchClasses()
    ]);
    setLoading(false);
  };

  const fetchAssignments = async () => {
    try {
      const response = await adminAPI.getTeacherAssignments();
      setAssignments(response.data || []);
    } catch (error) {
      console.error('Failed to load assignments:', error);
      toast.error('Failed to load assignments');
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await adminAPI.getAvailableTeachers();
      setTeachers(response.data || []);
    } catch (error) {
      console.error('Failed to load teachers:', error);
      toast.error('Failed to load teachers');
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await adminAPI.getSubjects();
      setSubjects(response.data || []);
    } catch (error) {
      console.error('Failed to load subjects:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await adminAPI.getClasses();
      setClasses(response.data || []);
    } catch (error) {
      console.error('Failed to load classes:', error);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    
    if (!newAssignment.teacher_id || !newAssignment.subject_id || !newAssignment.class_id) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      await adminAPI.createTeacherAssignment(newAssignment);
      toast.success('Teacher assigned successfully!');
      setShowCreateModal(false);
      setNewAssignment({ teacher_id: '', subject_id: '', class_id: '' });
      fetchAssignments();
    } catch (error) {
      console.error('Failed to create assignment:', error);
      toast.error(error.response?.data?.error || 'Failed to assign teacher');
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to remove this assignment?')) {
      return;
    }

    try {
      await adminAPI.deleteTeacherAssignment(assignmentId);
      toast.success('Assignment removed successfully!');
      fetchAssignments();
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      toast.error('Failed to remove assignment');
    }
  };

  // Get available classes for selected subject
  const getAvailableClassesForSubject = () => {
    if (!newAssignment.subject_id) return [];
    
    const subject = subjects.find(s => s.id === parseInt(newAssignment.subject_id));
    if (!subject || !subject.classes) return [];
    
    return subject.classes;
  };

  // Filter assignments
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.teacher?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.class?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = !filterSubject || assignment.subject?.id === parseInt(filterSubject);
    const matchesClass = !filterClass || assignment.class?.id === parseInt(filterClass);
    const matchesTeacher = !filterTeacher || assignment.teacher?.id === parseInt(filterTeacher);
    
    return matchesSearch && matchesSubject && matchesClass && matchesTeacher;
  });

  // Group assignments by teacher
  const groupedByTeacher = filteredAssignments.reduce((acc, assignment) => {
    const teacherId = assignment.teacher?.id;
    if (!acc[teacherId]) {
      acc[teacherId] = {
        teacher: assignment.teacher,
        assignments: []
      };
    }
    acc[teacherId].assignments.push(assignment);
    return acc;
  }, {});

  if (loading) return <Loading fullScreen />;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/admin/dashboard">
              <Button variant="secondary" size="sm">
                <HiArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Teacher Assignments
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage which teachers teach which subjects in which classes
              </p>
            </div>
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <HiUserAdd className="w-5 h-5 mr-2" />
            Assign Teacher
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Assignments</p>
                  <p className="text-3xl font-bold mt-2">{assignments.length}</p>
                </div>
                <HiAcademicCap className="w-12 h-12 text-blue-200" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Active Teachers</p>
                  <p className="text-3xl font-bold mt-2">{teachers.length}</p>
                </div>
                <HiUserGroup className="w-12 h-12 text-green-200" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Subjects</p>
                  <p className="text-3xl font-bold mt-2">{subjects.length}</p>
                </div>
                <HiAcademicCap className="w-12 h-12 text-purple-200" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white dark:bg-gray-800 mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <HiSearch className="inline w-4 h-4 mr-1" />
                  Search
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search teacher, subject, class..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                />
              </div>

              {/* Filter by Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <HiFilter className="inline w-4 h-4 mr-1" />
                  Subject
                </label>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                >
                  <option value="">All Subjects</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Class */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <HiFilter className="inline w-4 h-4 mr-1" />
                  Class
                </label>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                >
                  <option value="">All Classes</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Teacher */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <HiFilter className="inline w-4 h-4 mr-1" />
                  Teacher
                </label>
                <select
                  value={filterTeacher}
                  onChange={(e) => setFilterTeacher(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                >
                  <option value="">All Teachers</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Assignments List - Grouped by Teacher */}
        {Object.keys(groupedByTeacher).length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 p-12 text-center">
            <HiUserGroup className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Assignments Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start by assigning teachers to subjects and classes
            </p>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <HiUserAdd className="w-5 h-5 mr-2" />
              Assign First Teacher
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.values(groupedByTeacher).map(({ teacher, assignments }) => (
              <Card key={teacher?.id} className="bg-white dark:bg-gray-800">
                <div className="p-6">
                  {/* Teacher Header */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <HiUserGroup className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {teacher?.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {teacher?.unique_id} • {teacher?.email}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-full text-sm font-semibold">
                      {assignments.length} Assignment{assignments.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Assignments Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Subject
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Class
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignments.map(assignment => (
                          <tr 
                            key={assignment.id}
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                          >
                            <td className="py-3 px-4">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {assignment.subject?.name}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-gray-700 dark:text-gray-300">
                                {assignment.class?.name}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteAssignment(assignment.id)}
                              >
                                <HiTrash className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Assignment Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setNewAssignment({ teacher_id: '', subject_id: '', class_id: '' });
          }}
          title="Assign Teacher to Subject & Class"
        >
          <form onSubmit={handleCreateAssignment} className="space-y-4">
            {/* Teacher Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teacher *
              </label>
              <select
                value={newAssignment.teacher_id}
                onChange={(e) => setNewAssignment({ ...newAssignment, teacher_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                required
              >
                <option value="">Select Teacher</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} ({teacher.unique_id})
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject *
              </label>
              <select
                value={newAssignment.subject_id}
                onChange={(e) => setNewAssignment({ 
                  ...newAssignment, 
                  subject_id: e.target.value,
                  class_id: '' // Reset class when subject changes
                })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Class *
              </label>
              <select
                value={newAssignment.class_id}
                onChange={(e) => setNewAssignment({ ...newAssignment, class_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                disabled={!newAssignment.subject_id}
                required
              >
                <option value="">
                  {newAssignment.subject_id ? 'Select Class' : 'Select Subject First'}
                </option>
                {getAvailableClassesForSubject().map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Only classes where this subject is taught are shown
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-3 pt-4">
              <Button type="submit" variant="primary" className="flex-1">
                Assign Teacher
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewAssignment({ teacher_id: '', subject_id: '', class_id: '' });
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

export default ManageTeacherAssignments;