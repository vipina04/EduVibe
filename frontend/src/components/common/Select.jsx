import clsx from 'clsx';
import { forwardRef } from 'react';

const Select = forwardRef(({ 
  label, 
  error, 
  options = [], 
  className = '',
  placeholder = 'Select an option',
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={clsx(
          'w-full px-4 py-3 rounded-lg border transition-all duration-300',
          'bg-white dark:bg-gray-800',
          'border-gray-300 dark:border-gray-600',
          'text-gray-900 dark:text-white',
          'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
          className
        )}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
















// import { forwardRef } from 'react';

// const Select = forwardRef(({ 
//   label, 
//   error, 
//   options = [],
//   placeholder = 'Select...',
//   ...props 
// }, ref) => {
//   return (
//     <div className="w-full">
//       {label && (
//         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//           {label}
//         </label>
//       )}
//       <select
//         ref={ref}
//         className={`input-field ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
//         {...props}
//       >
//         <option value="">{placeholder}</option>
//         {options.map((option) => (
//           <option key={option.value} value={option.value}>
//             {option.label}
//           </option>
//         ))}
//       </select>
//       {error && (
//         <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
//       )}
//     </div>
//   );
// });

// Select.displayName = 'Select';

// export default Select;