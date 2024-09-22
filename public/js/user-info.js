fetch('/user-info')
  .then(response => response.json())
  .then(userData => {
    document.getElementById('user-avatar').src = `avatars/${userData.avatar_path}`;
    document.getElementById('user-name').textContent = userData.login;
    console.log(userData.avatar_path);
  })
  .catch(error => {
    console.log('🚀 ~ file: user-info.js:11 ~ error:', error);
  });
