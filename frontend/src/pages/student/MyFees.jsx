import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiArrowLeft, 
  HiCreditCard, 
  HiCheckCircle, 
  HiClock,
  HiExclamationCircle 
} from 'react-icons/hi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { studentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const MyFees = () => {
  // Initialize as empty array to prevent .reduce() errors on initial render
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feeSummary, setFeeSummary] = useState({
    total_paid: 0,
    pending_amount: 0,
    total_fees: 0
  });

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      const response = await studentAPI.getMyFees();
      
      // Safety check: Ensure we are working with an array
      const paymentData = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.payments || []);
        
      setPayments(paymentData);

      // Handle summary data if returned by API, otherwise calculate from array
      if (response.data?.summary) {
        setFeeSummary(response.data.summary);
      } else {
        const totalPaid = Array.isArray(paymentData) 
          ? paymentData.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) 
          : 0;
          
        setFeeSummary(prev => ({
          ...prev,
          total_paid: totalPaid,
          // You can update other summary fields here if available in response
        }));
      }
    } catch (error) {
      console.error('Failed to load fees:', error);
      toast.error('Failed to load fee records');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to safely calculate total even if state hasn't updated yet
  const safePayments = Array.isArray(payments) ? payments : [];

  if (loading) return <Loading fullScreen />;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/student/dashboard">
            <Button variant="secondary" size="sm">
              <HiArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Fee Management
          </h1>
        </div>

        {/* Fee Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-white dark:bg-gray-800 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">₹{feeSummary.total_paid}</p>
              </div>
              <HiCheckCircle className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-800 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending Amount</p>
                <p className="text-2xl font-bold text-yellow-600">₹{feeSummary.pending_amount}</p>
              </div>
              <HiClock className="w-8 h-8 text-yellow-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-800 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Fees</p>
                <p className="text-2xl font-bold text-blue-600">₹{feeSummary.total_fees || (Number(feeSummary.total_paid) + Number(feeSummary.pending_amount))}</p>
              </div>
              <HiCreditCard className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Payment History */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Payment History</h2>
        <Card className="overflow-hidden bg-white dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Receipt No</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Date</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Amount</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Method</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {safePayments.length > 0 ? (
                  safePayments.map((payment, index) => (
                    <tr key={payment.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        #{payment.receipt_no || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                        ₹{payment.amount}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {payment.payment_method || 'Online'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          SUCCESS
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center">
                        <HiExclamationCircle className="w-10 h-10 mb-2 opacity-20" />
                        <p>No payment records found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MyFees;




















// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { HiArrowLeft, HiCash, HiDownload, HiCheckCircle } from 'react-icons/hi';
// import DashboardLayout from '../../components/layout/DashboardLayout';
// import Card from '../../components/common/Card';
// import Loading from '../../components/common/Loading';
// import Button from '../../components/common/Button';
// import { studentAPI } from '../../services/api';
// import toast from 'react-hot-toast';

// const MyFees = () => {
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchPayments();
//   }, []);

//   const fetchPayments = async () => {
//     try {
//       const response = await studentAPI.getMyFees();
//       setPayments(response.data || []);
//     } catch (error) {
//       console.error('Failed to load fees:', error);
//       toast.error('Failed to load fee payments');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <Loading fullScreen />;

//   const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

//   return (
//     <DashboardLayout>
//       <div className="p-6 max-w-6xl mx-auto">
//         {/* Header */}
//         <div className="flex items-center space-x-4 mb-8">
//           <Link to="/student/dashboard">
//             <Button variant="secondary" size="sm">
//               <HiArrowLeft className="w-4 h-4 mr-2" />
//               Back
//             </Button>
//           </Link>
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
//               My Fee Payments
//             </h1>
//             <p className="text-gray-600 dark:text-gray-400 mt-1">
//               View your fee payment history and receipts
//             </p>
//           </div>
//         </div>

//         {/* Total Paid Card */}
//         <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg mb-8">
//           <div className="p-8">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-green-100 mb-2">Total Fees Paid</p>
//                 <p className="text-5xl font-bold">₹{totalPaid.toFixed(2)}</p>
//                 <p className="text-green-100 mt-2">{payments.length} payments made</p>
//               </div>
//               <HiCash className="w-20 h-20 opacity-80" />
//             </div>
//           </div>
//         </Card>

//         {/* Payment History */}
//         {payments.length === 0 ? (
//           <Card className="bg-white dark:bg-gray-800 p-12 text-center">
//             <HiCash className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
//               No Fee Payments Yet
//             </h3>
//             <p className="text-gray-600 dark:text-gray-400">
//               Your fee payment history will appear here.
//             </p>
//           </Card>
//         ) : (
//           <div className="space-y-4">
//             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
//               Payment History
//             </h2>
//             {payments.map((payment) => (
//               <Card 
//                 key={payment.id}
//                 className="bg-white dark:bg-gray-800 hover:shadow-lg transition-all"
//               >
//                 <div className="p-6">
//                   <div className="flex items-center justify-between">
//                     <div className="flex-1">
//                       <div className="flex items-center space-x-3 mb-2">
//                         <HiCheckCircle className="w-6 h-6 text-green-500" />
//                         <h3 className="text-lg font-bold text-gray-900 dark:text-white">
//                           Payment #{payment.id}
//                         </h3>
//                         <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
//                           Paid
//                         </span>
//                       </div>
                      
//                       <div className="grid grid-cols-3 gap-4 mt-4">
//                         <div>
//                           <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
//                           <p className="text-xl font-bold text-gray-900 dark:text-white">
//                             ₹{parseFloat(payment.amount).toFixed(2)}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
//                           <p className="text-sm font-medium text-gray-900 dark:text-white">
//                             {new Date(payment.paid_at).toLocaleDateString('en-US', {
//                               year: 'numeric',
//                               month: 'long',
//                               day: 'numeric'
//                             })}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
//                           <p className="text-sm font-medium text-gray-900 dark:text-white">
//                             {new Date(payment.paid_at).toLocaleTimeString('en-US', {
//                               hour: '2-digit',
//                               minute: '2-digit'
//                             })}
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="ml-6">
//                       {payment.receipt && (
//                         <a 
//                           href={payment.receipt}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                         >
//                           <Button variant="secondary" size="sm">
//                             <HiDownload className="w-4 h-4 mr-2" />
//                             Receipt
//                           </Button>
//                         </a>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </Card>
//             ))}
//           </div>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// };

// export default MyFees;


















// // import DashboardLayout from '../../components/layout/DashboardLayout';
// // export default function MyFees() {
// //   return (
// //     <DashboardLayout>
// //       <div className="p-6">
// //         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Fees - Coming Soon</h1>
// //       </div>
// //     </DashboardLayout>
// //   );
// // }