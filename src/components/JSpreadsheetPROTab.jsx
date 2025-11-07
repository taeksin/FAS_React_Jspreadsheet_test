import React, { useRef, useEffect } from 'react';
import { jspreadsheet } from '@jspreadsheet/react';
import parser from '@jspreadsheet/parser';
import 'jsuites/dist/jsuites.css';
import 'jspreadsheet/dist/jspreadsheet.css';

// 라이선스 키
const LICENSE_KEY = process.env.REACT_APP_JSPREADSHEET_LICENSE;
try {
  if (LICENSE_KEY) {
    jspreadsheet.setLicense(LICENSE_KEY);
    console.log('라이선스 로드 성공');
  }
} catch (e) {
  console.log(`라이선스 로드 실패(${e?.message || e})`);
}

jspreadsheet.setExtensions({ parser });

// 글로벌 스타일 설정
if (typeof document !== 'undefined') {
  const styleId = 'jspreadsheet-tab-custom-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* jSuites Tabs 스타일 */
      .jtabs-tab {
        font-size: 12px !important;
        padding: 8px 12px !important;
        background-color: #ecf0f1 !important;
        color: #ff0000 !important;
        border: 1px solid #bdc3c7 !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
      }

      .jtabs-tab:hover {
        background-color: #bdc3c7 !important;
      }

      /* 선택된 탭 스타일 */
      .jtabs-tab.jtabs-selected {
        background-color: #2c3e50 !important;
        color: #ffffff !important;
        border: 1px solid #1a252f !important;
        font-weight: 600 !important;
      }

      .jtabs-tab.jtabs-selected:hover {
        background-color: #34495e !important;
      }

      /* 탭 컨테이너 스타일 */
      .jtabs {
        border-bottom: 2px solid #bdc3c7 !important;
        padding: 4px !important;
        background-color: #f8f9fa !important;
      }

      /* jSpreadsheet의 탭 컨테이너 - 숨김 */
      .jss_tabs {
        display: none !important;
        height: 0 !important;
        visibility: hidden !important;
      }

      .jss_tab {
        display: none !important;
      }

      /* ✅ 커스텀 탭 버튼 스타일 */
      .custom-tab-container {
        display: flex;
        gap: 6px;
        margin-bottom: 8px;
        padding: 8px;
        background-color: #f8f9fa;
        border-bottom: 2px solid #bdc3c7;
        flex-wrap: wrap;
      }

      .custom-tab-btn {
        padding: 4px 8px;
        cursor: pointer;
        border: 1px solid #ccc;
        background: #fff;
        font-size: 14px;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .custom-tab-btn:hover {
        background-color: #e0e0e0;
      }

      .custom-tab-btn.active {
        border: 2px solid #007bff;
        background: #e8f0ff;
        font-weight: 600;
      }
    `;
    document.head.appendChild(style);
  }
}

export default function JSpreadsheetPROTab() {
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const instanceRef = useRef(null);
  const tabObserverRef = useRef(null);
  const customTabContainerRef = useRef(null);
  const worksheetNamesRef = useRef([]);

  const applyTabStylesDirectly = () => {
    if (!rootRef.current) return;

    // jSuites 탭 요소
    const jsuitesTabs = rootRef.current.querySelectorAll('.jtabs-tab');
    jsuitesTabs.forEach(tab => {
      if (tab.classList.contains('jtabs-selected')) {
        tab.style.backgroundColor = '#2c3e50';
        tab.style.color = '#ffffff';
        tab.style.fontWeight = '600';
        tab.style.fontSize = '12px';
        tab.style.padding = '8px 12px';
      } else {
        tab.style.backgroundColor = '#ecf0f1';
        tab.style.color = '#ff0000';
        tab.style.fontSize = '12px';
        tab.style.padding = '8px 12px';
      }
    });

    // jSpreadsheet 탭 요소
    const jssTabElements = rootRef.current.querySelectorAll('.jss_tab, .jss_tab_link');
    jssTabElements.forEach(tab => {
      if (tab.classList.contains('jss_tab_selected')) {
        tab.style.backgroundColor = '#2c3e50';
        tab.style.color = '#ffffff';
        tab.style.fontWeight = '600';
        tab.style.fontSize = '12px';
        tab.style.padding = '8px 12px';
      } else {
        tab.style.backgroundColor = '#ecf0f1';
        tab.style.color = '#ff0000';
        tab.style.fontSize = '12px';
        tab.style.padding = '8px 12px';
      }
    });
  };

  // ✅ 커스텀 탭 버튼 생성
  const createCustomTabs = (worksheetNames) => {
    if (!customTabContainerRef.current) return;

    customTabContainerRef.current.innerHTML = '';
    worksheetNamesRef.current = worksheetNames;

    worksheetNames.forEach((name, idx) => {
      const btn = document.createElement('button');
      btn.className = `custom-tab-btn ${idx === 0 ? 'active' : ''}`;
      btn.textContent = name || `Sheet${idx + 1}`;
      btn.type = 'button';

      btn.onclick = () => {
        try {
          const parent = Array.isArray(instanceRef.current)
            ? instanceRef.current?.[0]?.parent
            : instanceRef.current?.parent;
          
          if (parent && typeof parent.openWorksheet === 'function') {
            parent.openWorksheet(idx, true);

            // 탭 버튼 활성화 상태 업데이트
            Array.from(customTabContainerRef.current.children).forEach((b, i) => {
              if (i === idx) {
                b.classList.add('active');
              } else {
                b.classList.remove('active');
              }
            });

            console.log(`Sheet ${idx} (${name}) 전환 완료`);
          }
        } catch (err) {
          console.error('시트 전환 오류:', err);
        }
      };

      customTabContainerRef.current.appendChild(btn);
    });
  };

  useEffect(() => {
    return () => {
      if (tabObserverRef.current) {
        try {
          tabObserverRef.current.disconnect();
        } catch {}
        tabObserverRef.current = null;
      }

      if (instanceRef.current && instanceRef.current.destroy) {
        try {
          instanceRef.current.destroy();
        } catch {}
        instanceRef.current = null;
      }
    };
  }, []);

  const load = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;

    jspreadsheet.parser({
      file,
      locale: 'en-GB',
      onload: (config) => {
        try {
          if (instanceRef.current && instanceRef.current.destroy) {
            try {
              instanceRef.current.destroy();
            } catch {}
            instanceRef.current = null;
          }

          if (rootRef.current) {
            rootRef.current.innerHTML = '';
          }

          // ✅ 워크시트 이름 추출
          const worksheetNames = [];
          if (Array.isArray(config.worksheets)) {
            config.worksheets.forEach((sheet, idx) => {
              const name = sheet.worksheetName || sheet.name || `Sheet${idx + 1}`;
              worksheetNames.push(name);
            });
          }

          instanceRef.current = jspreadsheet(rootRef.current, config);

          // ✅ 커스텀 탭 생성
          createCustomTabs(worksheetNames);

          console.log('스프레드시트 로드 완료');

          setTimeout(() => {
            applyTabStylesDirectly();
            console.log('1차 탭 스타일 적용');
          }, 100);

          setTimeout(() => {
            applyTabStylesDirectly();
            console.log('2차 탭 스타일 적용');
          }, 200);

          if (rootRef.current && !tabObserverRef.current) {
            const tabsContainer = rootRef.current.querySelector('.jss_tabs') || 
                                 rootRef.current.querySelector('.jtabs');
            if (tabsContainer) {
              const observer = new MutationObserver(() => {
                setTimeout(() => {
                  applyTabStylesDirectly();
                }, 50);
              });

              observer.observe(tabsContainer, {
                attributes: true,
                attributeFilter: ['class'],
                subtree: true,
                childList: true,
              });

              tabObserverRef.current = observer;
              console.log('MutationObserver 등록');
            }
          }
        } catch (err) {
          alert(err?.message || 'Failed to open the XLSX file.');
          console.error('스프레드시트 생성 오류:', err);
        } finally {
          if (inputRef.current) inputRef.current.value = '';
        }
      },
      onerror: (error) => {
        alert(error);
        if (inputRef.current) inputRef.current.value = '';
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '10px' }}>
      <div style={{ marginBottom: '10px' }}>
        <button
          onClick={() => inputRef.current && inputRef.current.click()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          📁 파일 첨부
        </button>
      </div>

      <input
        ref={inputRef}
        id="file"
        type="file"
        name="file"
        accept=".xlsx,.xls"
        onChange={load}
        style={{ display: 'none' }}
      />

      {/* ✅ 커스텀 탭 컨테이너 */}
      <div ref={customTabContainerRef} className="custom-tab-container" />

      <div
        ref={rootRef}
        style={{
          flex: 1,
          width: '100%',
          border: '1px solid #ddd',
          borderRadius: '4px',
          overflow: 'auto',
          minHeight: '400px',
        }}
      />
    </div>
  );
}
