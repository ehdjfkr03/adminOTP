import { db, ref, get, update, remove } from "../firebase-config.js";

// 인증코드 다시 생성 메소드
async function regenerateCode(houseKey) {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 인증코드 생성
  const currentUser = JSON.parse(sessionStorage.getItem('loginUser'));// 세션에서 사용자 정보 확인
  if (!currentUser) {
    alert('로그인된 사용자 정보가 없습니다.');
    return;
  }

  const housePath = `users/${currentUser.key}/houses/${houseKey}`;
  await update(ref(db), { [housePath]: { code } });
  // housePath 경로에 새 인증코드 업데이트
  alert(`새 인증코드로 재생성: ${code}`);
  // 알림창 발생
  loadCodeList();
  // 목록 갱신
}

// 인증코드 삭제 메소드
async function deleteCode(houseKey) {
  const currentUser = JSON.parse(sessionStorage.getItem('loginUser'));
  // 세션으로 유저 정보 확인
  if (!currentUser) {
    alert('로그인된 사용자 정보가 없습니다.');
    return;
  }

  const housePath = `users/${currentUser.key}/houses/${houseKey}`;
  await remove(ref(db, housePath));
  // housePath 경로에 있는 값 삭제
  alert('인증코드가 삭제되었습니다.');
  // 알림창으로 삭제 알림
  loadCodeList();
  // 목록 갱신
}

// 목록 갱신 메소드
async function loadCodeList() {
  const currentUser = JSON.parse(sessionStorage.getItem('loginUser'));
  if (!currentUser) return;
  // 세션에서 유저 정보 확인

  const userKey = currentUser.key;
  const houseRef = ref(db, `users/${userKey}/houses`);
  const container = document.getElementById('code-list-container');
  // manage-code.html에 code-list-container라는 항목이 있음
  try {
    const snapshot = await get(houseRef);
    container.innerHTML = '';

    if (snapshot.exists()) {
      const houses = snapshot.val();
      Object.entries(houses).forEach(([houseKey, { code }]) => {
        const li = document.createElement('li');
        li.innerHTML = `
          <strong>${houseKey}</strong> - 인증코드: ${code}
          <button data-action="regenerate" data-key="${houseKey}">다시 생성</button>
          <button data-action="delete" data-key="${houseKey}">삭제</button>
        `;
        container.appendChild(li);
        // 인증코드 목록을 생성하고 container.appendChild(li)로 화면에 추가
      });
    } else {
      container.innerHTML = '<li>등록된 인증코드가 없습니다.</li>';
    }
  } catch (err) {
    console.error('목록 불러오기 오류:', err);
    alert('데이터를 불러오지 못했습니다.');
  }// 오류 발생 시 경고창
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('go-generate').addEventListener('click', () => {
    window.location.href = '../createPassword/createPassword.html';
    // 인증번호 생성 버튼(go-generate) 클릭 시 createPassword 화면으로 이동
  });

  document.getElementById('code-list-container').addEventListener('click', (e) => {
    // 인증코드 목록에 대한 동작
    const action = e.target.dataset.action;
    const key = e.target.dataset.key;
    if (action === 'regenerate') regenerateCode(key);
    // 인증코드 다시 생성 동작
    if (action === 'delete') deleteCode(key);
    // 인증코드 삭제 동작
  });

  loadCodeList();
  // 목록 갱신
});
