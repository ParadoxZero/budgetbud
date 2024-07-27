import { useSelector } from 'react-redux'

import { View } from './store'
import { OverviewPage } from './pages/overview';
import { CreateDummyData } from './utils';
import { PingRemote } from './services/ping_service';
import { CreateBudgetPage } from './pages/create_budget';

function render_view() {
  const view = useSelector((state: any) => state.navigation.current_view);

  switch (view) {
    case View.Overview:
      return <OverviewPage />
    case View.CreateBudget:
      return <CreateBudgetPage />
    default:
      return (<>Not Found</>)
  }
}

function CreateDummyDataIfRequired() {
  if (import.meta.env.VITE_CREATE_DUMMY_DATA !== 'true') {
    return;
  }
  localStorage.clear();
  localStorage.setItem('userData', JSON.stringify(CreateDummyData()));
}

function PingRemoteIfRequired() {
  if (import.meta.env.VITE_PING_REMOTE !== 'true') {
    return;
  }
  PingRemote().then((response) => { console.log(response) }).catch((error) => { console.log(error) }).catch((error) => { console.log(error) });
}

function App() {
  PingRemoteIfRequired();
  CreateDummyDataIfRequired();

  return (
    <>
      {render_view()}
    </>
  )
}

export default App
