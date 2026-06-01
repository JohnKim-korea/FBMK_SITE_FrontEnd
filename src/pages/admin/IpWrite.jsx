import { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";

function IpWrite () {
    const Ipdata = useLoaderData();
    const [title, setTitle] = useState(Ipdata?.title || "");
    const [name, setName] = useState(Ipdata?.name || "");
    const [ip, setIp] = useState(Ipdata?.ip || "");
    const [content, setContent] = useState(Ipdata?.content || "");
    
    const errorMessage = Ipdata?.message;
    const isUpdate = Ipdata  ? true : false;
    const [message,setMessage] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const onSubmitHandle = async (e) => {
      e.preventDefault();
      const formData = new FormData();
      if (title.length < 3 || title.length > 15) {
        setMessage("제목은 3자 이상 15자 이하로 입력해주세요");
        setIsSuccess(false);
        return;
      }

       if (name.trim().length === 0) {
         setMessage("이름을 입력해주세요");
         setIsSuccess(false);
         return;
       }

       if (ip.trim().length === 0) {
         setMessage("Ip를 입력해주세요");
         setIsSuccess(false);
         return;
       }

       if (content.trim().length === 0) {
         setMessage("내용을 입력해주세요");
         setIsSuccess(false);
         return;
       }
      
      if (isUpdate && Ipdata?.id !== undefined && Ipdata?.id !== null) {
        formData.append("id", Ipdata.id);
      }
      formData.append("title",title);
      formData.append("name", name);
      formData.append("ip", ip);
      formData.append("content", content);
      formData.append("isUpdate",isUpdate); // 수정 / 등록 여부

      try{
        const res = await fetch(`${import.meta.env.VITE_API_ADMIN}/ipWrite`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        const result = await res.json();
        if (!res.ok) {
          const error = new Error(
            result ? result.message : isUpdate ? "수정에 실패하셨습니다." : "등록에 실패하셨습니다.",
          );
          error.status = res.status;
          throw error;
        }
        setMessage(`${isUpdate ? "수정에 성공하셨습니다." : "등록에 성공하셨습니다."}`);
        setIsSuccess(true);

        if(window.opener && !window.opener.closed){
          window.opener.revalidateList();
        }
      }catch(error){
        setMessage(error.status + ":" + error.message);
        setIsSuccess(false);
      }
    };

     useEffect(() => {
       if(message){ 
       window.resizeTo(600, 750);
       }else{
        window.resizeTo(600, 650);
       }
     }, [message]);

     useEffect(()=>{
        if(errorMessage){
            setMessage(errorMessage);
            setIsSuccess(false);
        }
     },[]);

  return (
    <div style={{ padding: "20px" }}>
      <h4 className="mb-4 fw-bold">
        {" "}
        <i className="fa-solid fa-shield-halved me-2"></i>IP 차단 등록
      </h4>

      <form onSubmit={onSubmitHandle}>
        <div className="mb-3">
          <label className="form-label">제목</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">이름</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">IP</label>
          <input
            type="text"
            className="form-control"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">사유</label>
          <textarea
            className="form-control"
            rows="3"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="d-flex justify-content-center gap-2 mt-4 mb-3">
          <button
            type="submit"
            className={`btn btn-primary ${isUpdate ? "edit-btn" : ""}`}
          >
            {isUpdate ? "수정" : "등록"}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => window.close()}
          >
            닫기
          </button>
        </div>

        {message && (
          <div
            className={`mt-3 p-2 rounded text-center ${isSuccess ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

export default IpWrite;