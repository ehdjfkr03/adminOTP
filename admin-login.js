import { db, ref, get, child } from "./firebase-config.js";

// 로그인 함수수
export async function loginUser() {
  const inputId = document.getElementById('admin-id').value.trim();
  // index.html의 admin-id 항목에서 값을 받음
  const inputPassword = document.getElementById('admin-password').value.trim();
  // index.html의 admin-password 항목에서 값을 받음
  if (!inputId || !inputPassword) {
    alert('아이디와 비밀번호를 모두 입력해주세요.');
    return;
  }// 아이디 또는 비밀번호 존재 확인

  try {
    const dbRef = ref(db); // 파이어베이스 정보 요청
    const snapshot = await get(child(dbRef, 'users'));
    // 파이어베이스에서 users 항목 필터링
    if (!snapshot.exists()) {
      alert('사용자 정보가 없습니다.');
      return;
    }// users에 값 없으면 경고창창

    const users = snapshot.val();
    let foundUser = null;

    for (const key in users) {
      const user = users[key];
      if (user.id === inputId && user.password === inputPassword) {
        foundUser = { ...user, key };
        break;
      }
    }// users 안에 있는 값을 반복문으로 반복해서 입력한 id, password와 일치하는지 확인

    if (foundUser) {
      // 로그인 성공 후 세션에 저장
      sessionStorage.setItem('loginUser', JSON.stringify(foundUser));
      alert('로그인 성공!');

      // 로그인 성공 후 admin-dashboard.html로 이동
      window.location.href = '/adminOTP/passwordList/manage-codes.html';  // 상대 경로로 이동
    } else {
      alert('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  } catch (error) {
    console.error('로그인 중 오류:', error);
    alert('로그인에 실패했습니다: ' + error.message);
  }
}

// DOMContentLoaded 이벤트 리스너를 이용해 로그인 버튼 클릭 시 loginUser() 함수 호출
window.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.getElementById('login-button');
  // index.html의 login-button이라는 이름의 버튼
  loginButton.addEventListener('click', loginUser);
  // loginButton(login-button) 클릭하면 4번 줄의 loginUser 메소드 동작
});
