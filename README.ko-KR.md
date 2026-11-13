# TAIS Appearance

**Zotero를 위한 Glass 외관 및 읽기 환경 확장 프로그램입니다.** Theatre AI Studio(TAIS)가 개발합니다.

12개의 Glass 테마, 라이트/다크 모드, Zotero 인터페이스와 주석의 독립적인 글꼴 설정, 읽기 페이지 주변 투명도, 로컬 배경, 되돌릴 수 있는 미리보기, 프로필, 진단 및 안전 모드를 제공합니다.

## 언어
중국어 간체, 영어, 일본어, 한국어, 프랑스어를 지원하며 Zotero 언어를 따르는 자동 선택도 제공합니다. 번역 범위와 검토 상태는 docs/I18N-STATUS.md를 참조하세요.

## 지원 환경
검증 대상은 Windows 11, Zotero 10.0.8, PDF.js 5.7.0입니다. 네이티브 창 재질에 Windows DWM을 사용하므로 현재 릴리스는 Windows 전용이며 macOS와 Linux는 지원하지 않습니다.

## 설치
GitHub Releases에서 XPI를 다운로드한 다음 Zotero의 도구 → 플러그인 → 톱니바퀴 → 파일에서 플러그인 설치를 선택합니다. 문제가 생기면 TAIS Appearance의 복구 및 진단에서 Zotero 기본 외관으로 복원할 수 있습니다.

## 빌드
requirements-build.txt의 의존성을 설치하고 python build.py를 실행합니다. 빌드는 JavaScript, CSS, XML 및 회귀 테스트를 검사합니다.

## 개인정보와 라이선스
배경 이미지는 로컬에서 처리됩니다. PDF 텍스트 렌더링, 선택, 주석 및 문헌 데이터는 Zotero/PDF.js가 관리합니다. 파생 코드는 AGPL 조건에 따라 배포됩니다. LICENSE, NOTICE 및 docs/THIRD_PARTY_NOTICES.md를 확인하세요.

## 후원
GitHub Sponsors 등의 자발적인 후원은 유지보수와 문서화를 지원합니다. AGPL이 보장하는 권리를 제한하지 않습니다. 12개 테마는 모든 사용자에게 제공됩니다.
