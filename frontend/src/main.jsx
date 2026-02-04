import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter 
      future={{ 
        v7_startTransition: true, 
        v7_relativeSplatPath: true 
      }}
    >
      <ThemeProvider>
        <AuthProvider>
          <App />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)












// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import { BrowserRouter } from 'react-router-dom'
// import App from './App.jsx'
// import './index.css'
// import { Toaster } from 'react-hot-toast'
// import { AuthProvider } from './context/AuthContext'
// import { ThemeProvider } from './context/ThemeContext'

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <ThemeProvider>
//         <AuthProvider>
//           <App />
//           <Toaster position="top-right" />
//         </AuthProvider>
//       </ThemeProvider>
//     </BrowserRouter>
//   </React.StrictMode>,
// )






















// // import React from 'react'
// // import ReactDOM from 'react-dom/client'
// // import { BrowserRouter } from 'react-router-dom' // Added
// // import App from './App.jsx'
// // import './index.css'
// // import { Toaster } from 'react-hot-toast'
// // import { AuthProvider } from './context/AuthContext' // Added
// // import { ThemeProvider } from './context/ThemeContext' // Added

// // ReactDOM.createRoot(document.getElementById('root')).render(
// //   <React.StrictMode>
// //     {/* 1. Wrap with BrowserRouter for Navigation */}
// //     <BrowserRouter>
// //       {/* 2. Wrap with ThemeProvider for Dark/Light mode */}
// //       <ThemeProvider>
// //         {/* 3. Wrap with AuthProvider for Login functionality */}
// //         <AuthProvider>
// //           <App />
// //           <Toaster 
// //             position="top-right"
// //             toastOptions={{
// //               duration: 4000,
// //               style: {
// //                 background: '#363636',
// //                 color: '#fff',
// //               },
// //             }}
// //           />
// //         </AuthProvider>
// //       </ThemeProvider>
// //     </BrowserRouter>
// //   </React.StrictMode>,
// // )
















// // // import React from 'react'
// // // import ReactDOM from 'react-dom/client'
// // // import App from './App.jsx'
// // // import './index.css'
// // // import { Toaster } from 'react-hot-toast'

// // // ReactDOM.createRoot(document.getElementById('root')).render(
// // //   <React.StrictMode>
// // //     <App />
// // //     <Toaster 
// // //       position="top-right"
// // //       toastOptions={{
// // //         duration: 4000,
// // //         style: {
// // //           background: '#363636',
// // //           color: '#fff',
// // //         },
// // //         success: {
// // //           duration: 3000,
// // //           iconTheme: {
// // //             primary: '#10b981',
// // //             secondary: '#fff',
// // //           },
// // //         },
// // //         error: {
// // //           duration: 4000,
// // //           iconTheme: {
// // //             primary: '#ef4444',
// // //             secondary: '#fff',
// // //           },
// // //         },
// // //       }}
// // //     />
// // //   </React.StrictMode>,
// // // )











// // // // import React from 'react'
// // // // import ReactDOM from 'react-dom/client'
// // // // import App from './App.jsx'
// // // // import './index.css'
// // // // import { Toaster } from 'react-hot-toast'

// // // // ReactDOM.createRoot(document.getElementById('root')).render(
// // // //   <React.StrictMode>
// // // //     <App />
// // // //     <Toaster 
// // // //       position="top-right"
// // // //       toastOptions={{
// // // //         duration: 4000,
// // // //         style: {
// // // //           background: '#363636',
// // // //           color: '#fff',
// // // //         },
// // // //         success: {
// // // //           duration: 3000,
// // // //           iconTheme: {
// // // //             primary: '#10b981',
// // // //             secondary: '#fff',
// // // //           },
// // // //         },
// // // //         error: {
// // // //           duration: 4000,
// // // //           iconTheme: {
// // // //             primary: '#ef4444',
// // // //             secondary: '#fff',
// // // //           },
// // // //         },
// // // //       }}
// // // //     />
// // // //   </React.StrictMode>,
// // // // )










// // // // // import React from 'react';
// // // // // import ReactDOM from 'react-dom/client';
// // // // // import App from './App.jsx';
// // // // // import './index.css'; // <-- Tailwind CSS imported

// // // // // ReactDOM.createRoot(document.getElementById('root')).render(
// // // // //   <React.StrictMode>
// // // // //     <App />
// // // // //   </React.StrictMode>
// // // // // );











// // // // // // import { StrictMode } from 'react'
// // // // // // import { createRoot } from 'react-dom/client'
// // // // // // import './index.css'
// // // // // // import App from './App.jsx'

// // // // // // createRoot(document.getElementById('root')).render(
// // // // // //   <StrictMode>
// // // // // //     <App />
// // // // // //   </StrictMode>,
// // // // // // )
