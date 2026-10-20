const msg = document.getElementById('copy-msg');
document.getElementById('copy-address').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(document.getElementById('address').textContent);
    msg.textContent = '주소를 복사했습니다.';
  } catch {
    msg.textContent = '복사하지 못했습니다. 주소를 직접 선택해 복사해 주세요.';
  }
});
