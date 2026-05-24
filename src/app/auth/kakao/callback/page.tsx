import { Suspense } from "react";
import KakaoAuthCallbackPage from "@/page/kakao-auth-callback-page";

export default function KakaoCallbackRoute() {
  return (
    <Suspense fallback={null}>
      <KakaoAuthCallbackPage />
    </Suspense>
  );
}
