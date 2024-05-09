import './App.css'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import Form from './components/Form.tsx'

function App() {
  return (
    <HelmetProvider>
      <div className='h-screen flex items-center justify-center'>
        <Helmet>
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <title>Fancy Form</title>
        </Helmet>

        <Form />
      </div>
    </HelmetProvider>
  )
}

export default App
