import Modal from "@/components/Modal";

type PrivacyPolicyModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function PrivacyPolicyModal({
  open,
  onClose,
}: PrivacyPolicyModalProps) {
  return (
    <Modal isOpen={open} onClose={onClose}>
      <Modal.Overlay />
      <Modal.Content className="w-[640px]">
        <Modal.CloseButton />
        <Modal.Header className="flex flex-col items-center text-center">
          <Modal.Title size="sm" />
          <p className="mt-2 text-sm font-medium text-[#D6FDE5]">
            개인정보 처리방침
          </p>
        </Modal.Header>

        <Modal.Body className="max-h-[min(70vh,640px)] overflow-y-auto px-6 pb-8 text-bodySm text-[#D6FDE5]/85">
          <p className="leading-relaxed">
            <strong className="text-[#D6FDE5]">GRIT</strong>
            (
            <a
              href="https://grit-sigma.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-normal underline underline-offset-2 hover:text-green-light"
            >
              https://grit-sigma.vercel.app/
            </a>
            )은(는) 정보주체의 자유와 권리 보호를 위해 「개인정보 보호법」 및
            관계 법령이 정한 바를 준수하여, 적법하게 개인정보를 처리하고
            안전하게 관리하고 있습니다.
          </p>

          <p className="mt-4 leading-relaxed">
            이에 「개인정보 보호법」 제30조에 따라 정보주체에게 개인정보의
            처리와 보호에 관한 절차 및 기준을 안내하고, 이와 관련한 고충을
            신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이
            개인정보 처리방침을 수립·공개합니다.
          </p>

          <p className="mt-4 text-[#D6FDE5]/60">
            시행일: 2026-06-28 | 버전: 1.0
          </p>

          <section className="mt-6">
            <h2 className="text-bodyMd font-semibold text-[#D6FDE5]">
              1. 개인정보의 처리 목적
            </h2>
            <p className="mt-2 leading-relaxed">
              GRIT은(는) 다음의 목적을 위하여 개인정보를 처리합니다.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>회원 가입 및 관리</li>
              <li>서비스 제공</li>
              <li>콘텐츠 제공</li>
              <li>안전 및 보안</li>
              <li>부정이용 방지</li>
              <li>통계 분석</li>
              <li>연구 및 개발</li>
              <li>고객 상담</li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="text-bodyMd font-semibold text-[#D6FDE5]">
              2. 수집하는 개인정보 항목
            </h2>
            <p className="mt-2 leading-relaxed">
              <strong className="text-[#D6FDE5]">필수 항목:</strong> 이메일
              주소
            </p>
            <p className="mt-2 leading-relaxed">
              <strong className="text-[#D6FDE5]">자동 수집 항목:</strong> IP
              주소, 쿠키, 서비스 이용기록, 기기정보
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-bodyMd font-semibold text-[#D6FDE5]">
              수집 방법
            </h2>
            <p className="mt-2 leading-relaxed">
              홈페이지 회원가입, 쿠키(Cookie), IP 주소, 기기정보 수집
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-bodyMd font-semibold text-[#D6FDE5]">
              개인정보의 안전성 확보조치
            </h2>
            <p className="mt-2 leading-relaxed">
              <strong className="text-[#D6FDE5]">기술적 조치:</strong>
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>개인정보 암호화</li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="text-bodyMd font-semibold text-[#D6FDE5]">
              쿠키 및 행태정보 수집
            </h2>
            <p className="mt-2 leading-relaxed font-medium text-[#D6FDE5]">
              쿠키 사용
            </p>
            <p className="mt-2 leading-relaxed">
              <strong className="text-[#D6FDE5]">사용 목적:</strong> 로그인
              세션 유지
            </p>
            <p className="mt-2 leading-relaxed">
              <strong className="text-[#D6FDE5]">거부 방법:</strong>
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                [웹 브라우저] • Chrome: 설정 &gt; 개인정보 보호 및 보안 &gt;
                서드파티 쿠키 &gt; 서드파티 쿠키 차단 • Edge: 설정 &gt; 쿠키
                및 사이트 권한 &gt; 쿠키 및 사이트 데이터 관리 및 삭제 •
                Safari: 설정 &gt; Safari &gt; 고급 &gt; 모든 쿠키 차단
              </li>
              <li>
                [모바일] • Android: 설정 &gt; 보안 및 개인정보 보호 &gt; 광고
                &gt; 광고ID 삭제 • iPhone: 설정 &gt; 개인정보 보호 및 보안
                &gt; 추적 &gt; 앱 추적 허용 해제
              </li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="text-bodyMd font-semibold text-[#D6FDE5]">
              정보주체의 권리·의무 및 행사방법
            </h2>
            <p className="mt-2 leading-relaxed">
              <strong className="text-[#D6FDE5]">권리 행사 방법:</strong>{" "}
              website
            </p>
          </section>

          <section className="mt-6">
            <h2 className="text-bodyMd font-semibold text-[#D6FDE5]">
              개인정보 처리방침의 변경
            </h2>
            <p className="mt-2 leading-relaxed">
              이 개인정보 처리방침은 2026-06-28부터 적용됩니다.
            </p>
            <p className="mt-2 leading-relaxed">
              <strong className="text-[#D6FDE5]">변경 고지 방법:</strong>{" "}
              홈페이지 공지사항 게시
            </p>
          </section>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}
