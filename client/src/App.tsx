import React, { Suspense, lazy } from 'react';
import './App.css';
import { Route, BrowserRouter, Switch } from 'react-router-dom'

const App: React.FC = () => {
  return (
    <BrowserRouter>
    <Suspense fallback={<section>...</section>}   >
      <Switch>
        <Route path="/result" exact  component={lazy(() => import('./Result'))} />
        <Route path="/*" exact component={lazy(() => import('./Motion'))} ></Route>
      </Switch>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
