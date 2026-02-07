/**
 * 크롬 확장팩에서 콘솔 창에 입력하여 HTML 파일을 다운로드하는 스크립트
 */

const html = document.documentElement.outerHTML;
const blob = new Blob([html], { type: 'text/html' });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');  // 'a' → 'link'로 변경
link.href = url;
link.download = 'google-translate-page.html';
link.click();
URL.revokeObjectURL(url);

/**Body 만 파싱 */
const body = document.body.outerHTML;
const blobBody = new Blob([body], { type: 'text/html' });
const urlBody = URL.createObjectURL(blobBody);
const link = document.createElement('a');
link.href = urlBody;
link.download = 'google-translate-body-only.html';
link.click();
URL.revokeObjectURL(urlBody);