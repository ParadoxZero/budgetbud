/* 
 * BudgetBug - Budgeting and Expense Tracker with WebUI and API server
 * Copyright (C) 2024  Sidhin S Thomas <sidhin.thomas@gmail.com>
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * 
 * The source is available at: https://github.com/ParadoxZero/budgetbud
 */

import { CreateDummyData } from './utils';
import { GetAuthDetails, PingRemote } from './services/ping_service';
import CreateNewBudgetPage from './pages/create_new_budget_page';
import { ReactNode } from 'react';
import React from 'react';
import { connect } from 'react-redux';
import { ConfigProvider, Layout } from 'antd';
import Header from './components/header';
import Overview from './pages/overview';
import EditCategoriesPage from './pages/edit_categories_page';
import { Budget } from './datamodel/datamodel';
import CategoryDetails from './pages/view_expense_page';
import { View } from './store';


interface PreRun {
  condition: boolean;
  action: () => void;
}


export interface AppProps {
  view: View;
  is_header_visible: boolean;
  current_budget: Budget | null;
  is_budgets_available: boolean;
}

class App extends React.Component<AppProps> {
  pre_run: PreRun[] = [
    {
      condition: import.meta.env.VITE_PING_REMOTE === 'true',
      action:
        () => {
          PingRemote()
            .then((response) => { console.log(response) })
            .catch((error) => { console.log(error) });
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
    this.run_pre_run();
  }

  render(): ReactNode {
    GetAuthDetails()
      .then((response: any) => {
        console.log(response);
        localStorage.setItem('auth_provider', response.provider);
      });

    return (
      <ConfigProvider theme={{
        components: {
          Layout: {
            headerBg: 'white',
            bodyBg: 'white',
          },
          Timeline: {
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
        return <CreateNewBudgetPage is_other_budget_available={this.props.is_budgets_available} />
      case View.CategoryEdit:
        return <EditCategoriesPage budget={this.props.current_budget!} />
      case View.CategoryDetails:
        return <CategoryDetails budget={this.props.current_budget!} />
      default: return (<>Not Found</>)
    }
  }
}
function mapStateToProps(state: any): AppProps {
  let budget = null;
  if (state.budget.budget_list && state.budget.selected_budget_index !== null && state.budget.budget_list.length > state.budget.selected_budget_index) {
    budget = state.budget.budget_list[state.budget.selected_budget_index];
  }
  return {
    view: state.navigation.current_view,
    is_header_visible: state.header.is_visible,
    current_budget: budget,
    is_budgets_available: state.budget.budget_list.length > 0
  }
}

export default connect(mapStateToProps)(App);
