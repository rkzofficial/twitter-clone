import React from 'react';
import PropTypes from 'prop-types';
import { DropdownLink } from '../../UI/links';
import { SignoutButton } from '../../UI/button';
import Loading from '../../loading';

function DropdownMenu({ user, onLogout }) {
  if (user === null) {
    return (
      <div className="dropdown-content">
        <Loading />
      </div>
    );
  }

  let link = user.username ? '/' + user.username.toString() : '/';

  return (
    <div className="dropdown-content">
      <ul className="dropdown-menu">
        <div className="dropdown__user-info">
          <li className="dropdown-menu__item dropdown__name">
            {user.name || 'Unknown'}
          </li>
          <li className="dropdown-menu__item dropdown__username">
            @{user.username || 'Unknown'}
          </li>
        </div>
        <li className="dropdown-menu__item">
          <DropdownLink to={link}>
            <i className="far fa-user" /> Profile
          </DropdownLink>
        </li>
        <li className="dropdown-menu__item">
          <DropdownLink to="/settings">
            <i className="fas fa-cog" /> Settings
          </DropdownLink>
        </li>
        <li className="dropdown-menu__item">
          <DropdownLink to="/notfound">404 not found</DropdownLink>
        </li>
        <li className="dropdown-menu__item">
          <SignoutButton onClick={onLogout}>
            <i className="fas fa-sign-out-alt" /> Sign Out
          </SignoutButton>
        </li>
      </ul>
    </div>
  );
}

DropdownMenu.propTypes = {
  user: PropTypes.object,
  onLogout: PropTypes.func.isRequired
};

export default DropdownMenu;
