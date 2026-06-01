import { useEffect, useState } from "react";

function ScrollTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if(window.scrollY > 200){
        setVisible(true);
      }else{
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {visible && (
        <button
          onClick={scrollToTop}
          className="btn rounded-circle shadow-sm border-0 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "#7bc4f5",
            position: "fixed",
            bottom: "100px",
            right: "30px",
            width: "58px",
            height: "58px",
            zIndex: 999,
            transition: "0.2s",
          }}
        >
          <i
            className="bi bi-chevron-double-up"
            style={{
              color: "#1e3a5f",
              fontSize: "30px",
              lineHeight: 1,
            }}
          ></i>
        </button>
      )}
    </>
  );
}

export default ScrollTopButton;
