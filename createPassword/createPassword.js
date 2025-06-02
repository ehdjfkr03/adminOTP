import { db, ref, get, child, update } from "../firebase-config.js";

// 인증코드 생성 함수
async function generatePassword() {
  const type = document.getElementById('type').value; // 주거 타입(아파트, 원룸, 빌라라) 입력
  const dong = document.getElementById('dong').value.trim();// 동 입력
  const ho = document.getElementById('ho').value.trim();// 호 입력

  if (!dong || !ho) { // 동 또는 호가 없으면 경고창 발생
    alert('동과 호수를 모두 입력해주세요.');
    return;
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6자리 난수로 인증코드 생성
  const houseKey = `${type}-${dong}동-${ho}호`; // 파이어베이스에 들어가는 집 형식

  try {
    const dbRef = ref(db);// 파이어베이스에서 값 받아옴
    const snapshot = await get(child(dbRef, 'users')); // dbRef에서 users(집주인) 항목 필터링

    if (!snapshot.exists()) { // users 정보가 있는지 없는지 확인
      alert('사용자 정보가 없습니다.');
      return;
    }

    const users = snapshot.val();
    let userKey = null;

    const currentUser = JSON.parse(sessionStorage.getItem('loginUser'));
    // 세션에서 로그인 정보 확인(세션은 로그인하면 자동으로 생성)
    if (!currentUser) {
      alert('로그인된 사용자 정보가 없습니다.');
      return;
    }// 로그인 정보가 없으면 경고창 발생

    userKey = currentUser.key;

    const housePath = `users/${userKey}/houses/${houseKey}`;
    // 6자리 인증코드 저장위치 - housePath
    await update(ref(db), {
      [housePath]: { code }
    }); // housePath 위치에 인증코드 저장

    const resultEl = document.getElementById('result');
    resultEl.textContent = `비밀번호(인증코드): ${code}`;
    // 인증코드 복사
    navigator.clipboard.writeText(code).then(() => {
      alert('클립보드에 복사되었습니다.');
    }); 
  } catch (error) {
    console.error(error);
    alert('비밀번호 저장 실패: ' + error.message);
  }
}

// DOMContentLoaded 이후 버튼에 이벤트 등록
window.addEventListener('DOMContentLoaded', () => {
  const generateButton = document.getElementById('generate-button');
  // generate-button라는 이름의 버튼이 createPassword.html에 있음
  generateButton.addEventListener('click', generatePassword);
  // 클릭하면 위(4번째 줄)에 있는 generatePassword이라는 인증번호 생성 메소드 동작작
});
