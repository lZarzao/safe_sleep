const getUserInfo = (user) => {
  return {
    username: user.username,
    name: user.name,
    id: user.id || user._id,
    isAdmin: user.isAdmin
  };
};

export default getUserInfo;
