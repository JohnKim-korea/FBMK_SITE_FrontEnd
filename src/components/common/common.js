import Cookies from "js-cookie";

async function onClickBoardListViews(id) { // 조회수 증가 코드 
  const cookieName = "clicked";
  const cookieValue = Cookies.get(cookieName);
  let clickedArray = cookieValue ? JSON.parse(cookieValue) : [];

  const alreadyClick = clickedArray.includes(String(id)); // 아이디가 있는지 체크함 String으로 체크

  if (!alreadyClick) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/board/addViewCount?id=${id}`,{ method: "POST" });
      if (res.ok) {
        clickedArray.push(String(id));
        Cookies.set(cookieName, JSON.stringify(clickedArray));
      } else {
        console.log("조회수 증가 실패");
      }
    } catch (error) {
      console.error("네트워크 오류", error);
    }
  }
}


function uploadImg(loader, setShowModal, setModalText, setAlertState) {
  return {
    upload: async () => {
      try {
        const file = await loader.file;

        if (!file.type || !file.type.startsWith("image/")) {
          setShowModal(true);
          setModalText("이미지업로드만 가능합니다.");
          setAlertState("error");
          return Promise.reject(); // alert 창 막아줌
        }

        if (file.size > 5 * 1024 * 1024) {
          const size = file.size;
          const fileSize = (size) => {
            switch (true) {
              case size >= 1024 * 1024:
                return (size / (1024 * 1024)).toFixed(2) + " MB";

              case size >= 1024:
                return (size / 1024).toFixed(2) + " KB";

              default:
                return size + " B";
            }
          };
          setShowModal(true);
          setModalText(
            `이미지는 5MB 이하만 가능합니다. 이미지크기 : ${fileSize(size)} `,
          );
          setAlertState("error");
          return Promise.reject(); // 에러를 상위 함수로 전달
        }

        const formData = new FormData(); // 이걸 사용하면 번거롭게 header 안붙여도됨  Content-Type이 multipart/form-data 일때 적합
        formData.append("upload", file);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/board/upload`,
          {
            method: "POST",
            body: formData,
          },
        );
        // 에러처리
        if (!response.ok) {  //res.status >= 200 && res.status < 300 이면 true 그외면 false
           let message = "업로드 실패";
          const text = await response.text(); // text()는 body를 그대로 읽는다. 만약 서버의 body가 문자열일 경우에 말이다.
          try {
            const json = JSON.parse(text); // 해당 parse를 실패했을때 catch에서 해당 문자열을 받음
            message = json.message || message;
          } catch {
            message = text;
          }
          setShowModal(true);
          setAlertState("error");
          setModalText(message);
          return Promise.reject();
        }
        const result = await response.json(); // body에있는 (객체 , Map) 으로가져옴
        return { default: result.url }; //객체로 반환
      } catch (error) {
        // 네트워크 오류 처리
        setAlertState("error");
        setModalText(`네트워크 오류${error?.status ? ` (코드: ${error.status})` : ""}`);
        setShowModal(true);
        return Promise.reject();
      }
    },
  };
}


 async function uploadFile( files, currentFiles, setShowModal, setModalText, setAlertState ){
  try {
    if (!files || files.length === 0) {
      setShowModal(true);
      setModalText("업로드할 파일이 없습니다.");
      setAlertState("error");
      return null;
    }

    if (files.length + currentFiles.length > 2) {
      setShowModal(true);
      setModalText("파일은 최대 2개까지 업로드 가능합니다.");
      setAlertState("error");
      return null;
    }
    const fileSizeText = (size) => {
      switch (true) {
        case size >= 1024 * 1024:
          return (size / (1024 * 1024)).toFixed(2) + " MB";
        case size >= 1024:
          return (size / 1024).toFixed(2) + " KB";
        default:
          return size + " B";
      }
    };
    const formData = new FormData();
    for (const file of files) {
      if (file.size > 35 * 1024 * 1024) {
        setShowModal(true);
        setModalText(
          `파일당 35MB 이하만 가능합니다. \n파일 크기 : ${fileSizeText(file.size)}`,
        );
        setAlertState("error");
        return null;
      }

      if ( file.name.includes("|") || file.name.includes(",") ) {
        setShowModal(true);
        setModalText( "파일명에 | 또는 , 문자는 사용할 수 없습니다.");
        setAlertState("error");
        return null;
      }
      formData.append("files", file);
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/board/uploadFile`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      let message = "파일 업로드 실패";
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        message = json.message || message;
      } catch {
        message = text;
      }
      setShowModal(true);
      setModalText(message);
      setAlertState("error");
      return null;
    }
    const result = await response.json();
    return result.fileInfos;
  } catch (error) {
    setShowModal(true);
    setModalText(
      `네트워크 오류${error?.status ? ` (코드: ${error.status})` : ""}`
    );
    setAlertState("error");
    return null;
  }
}


 async function deleteUploadFile( fileInfo, setShowModal, setModalText, setAlertState) {
  try {
    const formData = new FormData();
    formData.append("fileInfo", fileInfo);
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/board/uploadDelete`,
      {
        method: "POST",
        body: formData,
      },
    );
    if (!response.ok) {
      let message = "파일 삭제 실패";
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        message = json.message || message;
      } catch {
        message = text;
      }
      setShowModal(true);
      setModalText(message);
      setAlertState("error");
      return false;
    }
    return true;
  } catch (error) {
    setShowModal(true);
    setModalText(
      `네트워크 오류${error?.status ? ` (코드: ${error.status})` : ""}`,
    );
    setAlertState("error");
    return false;
  }
}

 const checkStudyAuthCookie = async (category_id) => {
   const response = await fetch(
     `${import.meta.env.VITE_API_URL}/study/checkAuthCookie/${category_id}`,
     {
       method: "GET",
       credentials: "include",
     },
   );
   const data = await response.json();
   if (!response.ok || !data.check) {
     return false;
   }
   return true;
 };

// 학습도우미
 function uploadStudyImg(loader, setShowModal, setModalText, setAlertState) {
   return {
     upload: async () => {
       try {
         const file = await loader.file;

         if (!file.type || !file.type.startsWith("image/")) {
           setShowModal(true);
           setModalText("이미지업로드만 가능합니다.");
           setAlertState("error");
           return Promise.reject(); // alert 창 막아줌
         }

         if (file.size > 5 * 1024 * 1024) {
           const size = file.size;
           const fileSize = (size) => {
             switch (true) {
               case size >= 1024 * 1024:
                 return (size / (1024 * 1024)).toFixed(2) + " MB";

               case size >= 1024:
                 return (size / 1024).toFixed(2) + " KB";

               default:
                 return size + " B";
             }
           };
           setShowModal(true);
           setModalText(
             `이미지는 5MB 이하만 가능합니다. 이미지크기 : ${fileSize(size)} `,
           );
           setAlertState("error");
           return Promise.reject(); // 에러를 상위 함수로 전달
         }

         const formData = new FormData(); // 이걸 사용하면 번거롭게 header 안붙여도됨  Content-Type이 multipart/form-data 일때 적합
         formData.append("upload", file);

         const response = await fetch(
           `${import.meta.env.VITE_API_URL}/study/upload`,
           {
             method: "POST",
             body: formData,
           },
         );
         // 에러처리
         if (!response.ok) {
           //res.status >= 200 && res.status < 300 이면 true 그외면 false
           let message = "업로드 실패";
           const text = await response.text(); // text()는 body를 그대로 읽는다. 만약 서버의 body가 문자열일 경우에 말이다.
           try {
             const json = JSON.parse(text); // 해당 parse를 실패했을때 catch에서 해당 문자열을 받음
             message = json.message || message;
           } catch {
             message = text;
           }
           setShowModal(true);
           setAlertState("error");
           setModalText(message);
           return Promise.reject();
         }
         const result = await response.json(); // body에있는 (객체 , Map) 으로가져옴
        return {
          default: `${import.meta.env.VITE_STUDY_IMAGE_URL}${result.url}`,
        };
       } catch (error) {
         // 네트워크 오류 처리
         setAlertState("error");
         setModalText(
           `네트워크 오류${error?.status ? ` (코드: ${error.status})` : ""}`,
         );
         setShowModal(true);
         return Promise.reject();
       }
     },
   };
 }

export { onClickBoardListViews, uploadImg, uploadFile ,deleteUploadFile, checkStudyAuthCookie, uploadStudyImg};