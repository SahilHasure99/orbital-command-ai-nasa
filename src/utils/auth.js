// MISSIONVERSE User Authentication & LocalStorage Session Management

const USERS_KEY = 'mc_users';
const SESSION_KEY = 'mc_session';

const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
  } catch {
    return {};
  }
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const register = (username, password) => {
  if (!username || !password) {
    return { success: false, error: 'Callsign and passcode required' };
  }
  if (username.length < 2) {
    return { success: false, error: 'Callsign must be at least 2 characters' };
  }

  const users = getUsers();
  if (users[username]) {
    return { success: false, error: 'Callsign already registered. Please log in.' };
  }

  users[username] = {
    username,
    password,
    createdAt: new Date().toISOString(),
    missions: [],
    achievements: [],
  };
  saveUsers(users);

  // Auto login
  localStorage.setItem(SESSION_KEY, username);
  return { success: true, user: users[username] };
};

export const login = (username, password) => {
  const users = getUsers();
  const user = users[username];

  if (!user || user.password !== password) {
    return { success: false, error: 'Invalid callsign or passcode' };
  }

  localStorage.setItem(SESSION_KEY, username);
  return { success: true, user };
};

export const guestLogin = (callsign = 'Commander Nova') => {
  const users = getUsers();
  if (!users[callsign]) {
    users[callsign] = {
      username: callsign,
      password: 'guest_mode',
      createdAt: new Date().toISOString(),
      missions: [],
      achievements: []
    };
    saveUsers(users);
  }
  localStorage.setItem(SESSION_KEY, callsign);
  return users[callsign];
};

export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = () => {
  let username = localStorage.getItem(SESSION_KEY);
  if (!username) {
    // Default to guest commander for immediate seamless access
    return guestLogin('Commander Nova');
  }
  const users = getUsers();
  return users[username] || guestLogin(username);
};

export const saveMission = (mission) => {
  const username = localStorage.getItem(SESSION_KEY) || 'Commander Nova';
  const users = getUsers();
  if (!users[username]) {
    users[username] = {
      username,
      password: 'guest_mode',
      createdAt: new Date().toISOString(),
      missions: [],
      achievements: []
    };
  }

  const newMission = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    ...mission,
  };

  users[username].missions = [newMission, ...(users[username].missions || [])].slice(0, 100);
  saveUsers(users);
  return { success: true, mission: newMission };
};

export const getMissions = () => {
  const user = getCurrentUser();
  return user?.missions || [];
};

export const getUserXP = () => {
  const user = getCurrentUser();
  return user?.xp || 0;
};

export const addXP = (amount) => {
  const username = localStorage.getItem(SESSION_KEY) || 'Commander Nova';
  const users = getUsers();
  if (!users[username]) return 0;
  users[username].xp = (users[username].xp || 0) + amount;
  saveUsers(users);
  return users[username].xp;
};

export const getUserAchievements = () => {
  const user = getCurrentUser();
  return user?.achievements || [];
};

export const unlockAchievement = (id) => {
  const username = localStorage.getItem(SESSION_KEY) || 'Commander Nova';
  const users = getUsers();
  if (!users[username]) return false;
  const current = users[username].achievements || [];
  if (!current.includes(id)) {
    users[username].achievements = [...current, id];
    saveUsers(users);
    return true;
  }
  return false;
};

export const deleteMission = (id) => {
  const username = localStorage.getItem(SESSION_KEY);
  if (!username) return;

  const users = getUsers();
  if (!users[username]) return;

  users[username].missions = (users[username].missions || []).filter((m) => m.id !== id);
  saveUsers(users);
};

export const deleteUser = () => {
  const username = localStorage.getItem(SESSION_KEY);
  if (!username) return { success: false, error: 'Not logged in' };
  const users = getUsers();
  if (!users[username]) return { success: false, error: 'User not found' };
  delete users[username];
  saveUsers(users);
  localStorage.removeItem(SESSION_KEY);
  return { success: true };
};
