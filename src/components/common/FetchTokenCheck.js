/*
fetch가 서버 응답을 기다리는동안 다른코드가 실행되므로 api2 ,api3 가 실행될수밖에없다.

API1 → refresh 시작
API2 → refresh 기다림 (다시 if문으로 돌아가지 않음 그냥 건너띔 왜냐 js는 위에서 아래로 한번만 실행되기 때문이다.)
API3 → refresh 기다림 (다시 if문으로 돌아가지 않음 그냥 건너띔 왜냐 js는 위에서 아래로 한번만 실행되기 때문이다.)
↓
refresh 완료
↓
모든 API 재요청
*/
let refreshPromise = null;
// 이함수는 수정 삭제 등록 을 하다가 접근토큰이 만료되었을때 자동으로 접근토큰을 갱신해주는 함수
export async function FetchTokenCheck(url, option = {}, setAccessToken) { // setState함수는 참조값이 변하지 않다.
  let active = await fetch(`${import.meta.env.VITE_API_URL}/auth/checkSuspended`,{method:"GET",credentials : "include"}); // 계정정지 체크
  
  if (!active.ok) {
    if (active.status === 403) {
      const errorData = await active.json();
      throw new Error(errorData.message); // suspanded_member
    }
    // 401, 500 등은 그냥 무시하고 아래 로직으로 진행
  } 
  
  let res = await fetch(url, option);
  
  if (res.status !== 401) return res;
  
  // refresh 요청이 이미 진행 중이면 건너띔
  if (!refreshPromise) {
    refreshPromise = fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    }).then(async (refreshRes) => {
        const data = await refreshRes.json();
        
        if (!refreshRes.ok) {
          throw new Error(data.message);
        }
        return data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
 }

  const newAccessToken = await refreshPromise;
  setAccessToken(newAccessToken);
  // 재요청에 접근토큰 변경된거 추가
  option.headers = {
    ...(option.headers || {}),
    Authorization: `Bearer ${newAccessToken}`,
  };
  return fetch(url, option);
}

// if (error.message === "Not_Refresh_Token") {
//   logout(); // useAuth 에서 뽑아와야됨
//   navigate("/", {
//     state: {
//       alertState: "error",
//       modalText: "로그인이 만료되었습니다. 다시 로그인해주세요.",
//       showModal: true
//     },
//     replace: true
//   });
// } 이걸 에러부분에 적으면됨