import { LoginPage } from './pages/login'
import { useSelector } from 'react-redux'

import { View } from './store'
import { OverviewPage } from './pages/overview';

function render_view() {
  const view = useSelector((state: any) => state.navigation.current_view);

  switch (view) {
    case View.Login:
      return <LoginPage />
    case View.Overview:
      return <OverviewPage />
  }
}

function App() {

  return (
    <>
      {render_view()}
    </>
  )
}

export default App
