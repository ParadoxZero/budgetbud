import { LoginPage } from './pages/login'
import { useSelector } from 'react-redux'

import { View } from './store'
import { OverviewPage } from './pages/overview';
import { Flex } from 'antd';

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
    <Flex align="center" justify="center" vertical style={{ height: "100vh", flexGrow: 1, width: "100vw" }} >
      {render_view()}
    </ Flex>
  )
}

export default App
