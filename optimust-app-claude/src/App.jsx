import { RouterProvider } from 'react-router-dom'
import './App.css'
import { router } from './router'
import ThemeProvider from './context/Theme/ThemeProvider.jsx'
import { ToastContainer } from 'react-toastify'
import { registerLicense } from '@syncfusion/ej2-base';

registerLicense("NxYtGyMROh0gHDMgDk1jXU9FaF5FVmJLYVdpR2Nbek55flVHalhZVAciSV9jS3tSdEVhWX1bc3ZWQmFdWE91Xg==");

function App() {
  // console.log('render')
  return (
    <>
      <ThemeProvider>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <RouterProvider router={router} />
      </ThemeProvider>
    </>
  )
}

export default App
