import { navigation, store, View } from './store'
import { OverviewPage } from './pages/overview';
import { CreateDummyData } from './utils';
import { PingRemote } from './services/ping_service';
import NoBudgetAvailablePage from './pages/no-budget_page';
import { ReactNode } from 'react';
import React from 'react';
import { connect } from 'react-redux';



const pre_run = [
  () => {
    if (import.meta.env.VITE_CREATE_DUMMY_DATA === 'true') {
      localStorage.clear();
      localStorage.setItem('userData', JSON.stringify(CreateDummyData()));
    }
  },
  () => {
    if (import.meta.env.VITE_PING_REMOTE === 'true') {
      PingRemote().then((response) => { console.log(response) }).catch((error) => { console.log(error) }).catch((error) => { console.log(error) });
    }
  },
  () => {
    if (import.meta.env.VITE_CLEAR_USER_DATA_ON_LOAD === 'true') {
      localStorage.clear();
    }
  }
]

function run_pre_run() {
  pre_run.forEach((f) => f());
}

export interface AppProps {
  view: View;
}

class App extends React.Component<AppProps> {

  constructor(props: AppProps) {
    super(props);
    this.state = {
      view: View.Overview
    }
  }

  componentDidMount(): void {
    run_pre_run();
  }

  render(): ReactNode {
    return (
      <>
        {this.render_view()}
      </>
    );
  }

  render_view() {
    const view = this.props.view;

    switch (view) {
      case View.Overview:
        return <OverviewPage />
      case View.NoBudgetAvailable:
        return <NoBudgetAvailablePage />
      default:
        return (<>Not Found</>)
    }
  }
}
function mapStateToProps(state: any): AppProps {
  return { view: state.navigation.current_view }
}

export default connect(mapStateToProps)(App);
