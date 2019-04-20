import React, { useState } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import checkForToken from './utils/checkForToken';

import { Provider } from 'react-redux';
import store from './store';

// import PrivateRoute from './components/PrivateRoute';
import PrivateHomepage from './components/PrivateHomepage';

import SignInContainer from './containers/SignInContainer';
import SignUpContainer from './containers/SignUpContainer';
import ProfileContainer from './containers/ProfileContainer';
import SettingsContainer from './containers/SettingsContainer';
import CreateTweetContainer from './containers/CreateTweetContainer';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

checkForToken();

function App() {
  const [openTweetModal, setTweetModal] = useState(false);

  const handleOpenTweetModal = () => setTweetModal(true);
  const handleCloseTweetModal = () => setTweetModal(false);

  return (
    <Provider store={store}>
      <Router>
        <div className="wrapper">
          <div className="content">
            <Header />
            <Switch>
              {/* <PrivateRoute
                path="/create-tweet"
                component={CreateTweetContainer}
              /> */}
              {openTweetModal && (
                <CreateTweetContainer
                  openModal={handleOpenTweetModal}
                  closeModal={handleCloseTweetModal}
                />
              )}
              <Route exact path="/" component={PrivateHomepage} />
              <Route exact path="/signin" component={SignInContainer} />
              <Route exact path="/signup" component={SignUpContainer} />
              <Route exact path="/settings" component={SettingsContainer} />
              <Route exact path="/:username" component={ProfileContainer} />
              <Route render={() => <div>404 Not Found</div>} />
            </Switch>
          </div>
          <Footer />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
