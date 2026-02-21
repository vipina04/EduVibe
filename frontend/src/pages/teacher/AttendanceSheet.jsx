import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import { teacherAPI } from '../../services/api';
import { HiCheck, HiX, HiArrowLeft, HiCalendar, HiClock } from 'react-icons/hi';

const AttendanceSheet = () => {
  const { classId, subjectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { className, subjectName } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // NEW: Time fields
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    fetchStudents();
  }, [classId]);

  // NEW: Calculate duration when times change
  useEffect(() => {
    if (fromTime && toTime) {
      calculateDuration();
    }
  }, [fromTime, toTime]);

  const calculateDuration = () => {
    if (!fromTime || !toTime) {
      setDuration(0);
      return;
    }

    try {
      const [fromHour, fromMin] = fromTime.split(':').map(Number);
      const [toHour, toMin] = toTime.split(':').map(Number);
      
      const fromMinutes = fromHour * 60 + fromMin;
      const toMinutes = toHour * 60 + toMin;
      
      const diff = toMinutes - fromMinutes;
      
      if (diff < 0) {
        toast.error('End time must be after start time');
        setDuration(0);
      } else {
        setDuration(diff);
      }
    } catch (error) {
      setDuration(0);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getClassStudents(classId);
      const studentsData = response.data;
      setStudents(studentsData);
      
      // Initialize all as present by default
      const initialAttendance = {};
      studentsData.forEach(student => {
        initialAttendance[student.id] = true;
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const markAllPresent = () => {
    const allPresent = {};
    students.forEach(student => {
      allPresent[student.id] = true;
    });
    setAttendance(allPresent);
  };

  const markAllAbsent = () => {
    const allAbsent = {};
    students.forEach(student => {
      allAbsent[student.id] = false;
    });
    setAttendance(allAbsent);
  };

  const handleSubmit = async () => {
    // Validate time fields
    if (fromTime && !toTime) {
      toast.error('Please enter end time');
      return;
    }
    if (!fromTime && toTime) {
      toast.error('Please enter start time');
      return;
    }
    if (fromTime && toTime && duration <= 0) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      setSubmitting(true);
      
      // Get list of present student IDs
      const presentStudentIds = Object.keys(attendance).filter(
        id => attendance[id]
      ).map(id => parseInt(id));

      const attendanceData = {
        class_id: parseInt(classId),
        subject_id: parseInt(subjectId),
        date: date,
        student_ids: presentStudentIds
      };

      // Add time fields if provided
      if (fromTime && toTime) {
        attendanceData.from_time = fromTime;
        attendanceData.to_time = toTime;
      }

      await teacherAPI.markAttendance(attendanceData);

      toast.success('Attendance marked successfully!');
      navigate('/teacher/attendance');
    } catch (error) {
      console.error('Failed to mark attendance:', error);
      toast.error(error.response?.data?.error || 'Failed to mark attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDuration = (minutes) => {
    if (minutes === 0) return '0 min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const absentCount = students.length - presentCount;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading students...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/teacher/attendance')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <HiArrowLeft className="w-5 h-5" />
            Back to Attendance
          </button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Mark Attendance
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {className} - {subjectName}
              </p>
            </div>
          </div>
        </div>

        {/* Date and Time Section - NEW LAYOUT */}
        <Card className="mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Class Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <HiCalendar className="inline w-4 h-4 mr-1" />
                  Date *
                </label>
                <input
                  type="date"
                  value={date}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* From Time - NEW */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <HiClock className="inline w-4 h-4 mr-1" />
                  From Time
                </label>
                <input
                  type="time"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* To Time - NEW */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <HiClock className="inline w-4 h-4 mr-1" />
                  To Time
                </label>
                <input
                  type="time"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Duration - NEW (Auto-calculated) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (Auto)
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                  {formatDuration(duration)}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{students.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Present</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{presentCount}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Absent</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{absentCount}</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={markAllPresent}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
          >
            <HiCheck className="w-5 h-5" />
            Mark All Present
          </button>
          <button
            onClick={markAllAbsent}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
          >
            <HiX className="w-5 h-5" />
            Mark All Absent
          </button>
        </div>

        {/* Student List - UPDATED TO SHOW NAMES */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Roll Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Student Name {/* CHANGED FROM "Unique ID" */}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {students.map((student, index) => (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {student.roll_number || student.unique_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {student.full_name} {/* CHANGED: Now shows full name */}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {student.unique_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => toggleAttendance(student.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          attendance[student.id]
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800'
                        }`}
                      >
                        {attendance[student.id] ? (
                          <span className="flex items-center gap-2">
                            <HiCheck className="w-5 h-5" />
                            Present
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <HiX className="w-5 h-5" />
                            Absent
                          </span>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={() => navigate('/teacher/attendance')}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <HiCheck className="w-5 h-5" />
                Mark Attendance
              </>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AttendanceSheet;




