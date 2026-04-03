import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const KEEP_SCROLL_PATHS = ["/user/jobs/all", "/company/aplicants"];

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const shouldKeepScroll = KEEP_SCROLL_PATHS.some((path) =>
      pathname.startsWith(path)
    );

    if (!shouldKeepScroll) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
