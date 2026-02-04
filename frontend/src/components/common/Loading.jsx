const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-teal-200 dark:border-teal-900 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">{message}</p>
    </div>
  );
};

export default Loading;



















// const Loading = ({ fullScreen = false, text = 'Loading...' }) => {
//   if (fullScreen) {
//     return (
//       <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
//         <div className="text-center">
//           <div className="spinner w-16 h-16 mb-4 mx-auto"></div>
//           <p className="text-gray-600 dark:text-gray-400 text-lg">{text}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex items-center justify-center p-8">
//       <div className="text-center">
//         <div className="spinner w-12 h-12 mb-3 mx-auto"></div>
//         <p className="text-gray-600 dark:text-gray-400">{text}</p>
//       </div>
//     </div>
//   );
// };

// export default Loading;














// // const Loading = ({ size = 'md', fullScreen = false }) => {
// //   const sizes = {
// //     sm: 'w-8 h-8 border-2',
// //     md: 'w-12 h-12 border-3',
// //     lg: 'w-16 h-16 border-4',
// //   };

// //   if (fullScreen) {
// //     return (
// //       <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50">
// //         <div className="text-center">
// //           <div className={`spinner ${sizes[size]} mx-auto mb-4`} />
// //           <p className="text-gray-600 dark:text-gray-400">Loading...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="flex items-center justify-center p-8">
// //       <div className={`spinner ${sizes[size]}`} />
// //     </div>
// //   );
// // };

// // export default Loading;