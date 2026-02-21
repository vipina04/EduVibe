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






















