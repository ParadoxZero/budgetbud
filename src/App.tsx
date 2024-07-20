import { useSelector } from 'react-redux'

import { View } from './store'
import { OverviewPage } from './pages/overview';
import { CreateDummyData } from './utils';

function render_view() {
  const view = useSelector((state: any) => state.navigation.current_view);

  switch (view) {
    case View.Overview:
      return <OverviewPage />
  }
}

function CreateDummyDataIfRequired() {
  // only for development mode
  if (!import.meta.env.DEV) {
    return;
  }
  localStorage.clear();
  localStorage.setItem('userData', JSON.stringify(CreateDummyData()));
}

function App() {
  CreateDummyDataIfRequired();

  return (
    <>
      {render_view()}
    </>
  )
}

export default App
