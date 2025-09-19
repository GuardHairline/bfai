import { useState, useCallback } from 'react';
import { message } from 'antd';
import { fetchPersons as apiFetchPersons } from '../services/api';

export const useAuth = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [persons, setPersons] = useState([]);

  const fetchPersons = useCallback(async () => {
    try {
      const fetchedPersons = await apiFetchPersons();
      setPersons(fetchedPersons);
      setIsLoginModalVisible(true);
    } catch (error) {
      // Error is already handled and logged in api.js
    }
  }, []);

  const handleToggleLogin = useCallback(() => {
    if (loggedInUser) {
      setLoggedInUser(null);
      message.success('已登出');
    } else {
      fetchPersons();
    }
  }, [loggedInUser, fetchPersons]);

  const login = (user) => {
    setLoggedInUser(user);
    setIsLoginModalVisible(false);
    message.success(`已作为 ${user.name} 登录`);
  };

  const logout = () => {
    setLoggedInUser(null);
    message.success('已登出');
  }

  return {
    loggedInUser,
    isLoginModalVisible,
    persons,
    handleToggleLogin,
    login,
    logout,
    setIsLoginModalVisible,
  };
};
