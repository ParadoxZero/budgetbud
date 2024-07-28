import { navigation, store, View } from './store'
import { CreateDummyData } from './utils';
import { PingRemote } from './services/ping_service';
import NoBudgetAvailablePage from './pages/no-budget_page';
import { ReactNode } from 'react';
import React from 'react';
import { connect } from 'react-redux';
import { ConfigProvider, Layout } from 'antd';
import Header from './components/header';
import Overview from './pages/overview';


interface PreRun {
  condition: boolean;
  action: () => void;
}


export interface AppProps {
  view: View;
  is_header_visible: boolean;
}

class App extends React.Component<AppProps> {
  pre_run: PreRun[] = [
    {
      condition: import.meta.env.VITE_PING_REMOTE === 'true',
      action:
        () => {
          PingRemote().then((response) => { console.log(response) }).catch((error) => { console.log(error) }).catch((error) => { console.log(error) });
        }
    },
    {
      condition: import.meta.env.VITE_CLEAR_USER_DATA_ON_LOAD === 'true',
      action:
        () => {
          localStorage.clear();
        }
    },
    {
      condition: import.meta.env.VITE_CREATE_DUMMY_DATA === 'true',
      action: () => {
        localStorage.clear();
        localStorage.setItem('userData', JSON.stringify(CreateDummyData()));
      }
    }
  ];

  run_pre_run() {
    this.pre_run.forEach((pre_run) => pre_run.condition ? pre_run.action() : null);
  }

  constructor(props: AppProps) {
    super(props);
    this.state = {
      view: View.Overview,
      is_header_visible: true
    }
  }

  componentDidMount(): void {
    this.run_pre_run();
  }

  render(): ReactNode {
    return (
      <ConfigProvider theme={{
        components: {
          Layout: {
            headerBg: 'white',
            bodyBg: 'white',
          }
        }
      }}>
        <Layout>
          <Layout.Header style={{ position: 'sticky', padding: 10 }} hidden={!this.props.is_header_visible}>
            <Header />
          </Layout.Header>
          <Layout.Content>
            {this.render_view()}
          </Layout.Content>
        </Layout>
      </ConfigProvider>
    );
  }

  render_view() {
    const view = this.props.view;

    switch (view) {
      case View.Overview:
        return <Overview />
      case View.NoBudgetAvailable:
        return <NoBudgetAvailablePage />
      default:
        return (<>Not Found</>)
    }
  }
}
function mapStateToProps(state: any): AppProps {
  return {
    view: state.navigation.current_view,
    is_header_visible: state.header.is_visible,
  }
}

export default connect(mapStateToProps)(App);
