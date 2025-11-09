import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <div className="min-h-screen flex items-center justify-center bg-background">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-foreground mb-4">
                  EaseQuote AI
                </h1>
                <p className="text-muted-foreground">
                  Project setup complete! ✅
                </p>
              </div>
            </div>
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
