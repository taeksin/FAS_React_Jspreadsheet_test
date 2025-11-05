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

      /* jSpreadsheet의 탭 컨테이너 */
      .jss_tabs {
        display: flex !important;
        gap: 2px !important;
        padding: 4px !important;
        background-color: #f8f9fa !important;
        border-bottom: 2px solid #bdc3c7 !important;
      }

      .jss_tab {
        font-size: 12px !important;
        padding: 8px 12px !important;
        background-color: #ecf0f1 !important;
        color: #ff0000 !important;
        border: 1px solid #bdc3c7 !important;
        border-radius: 4px 4px 0 0 !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
      }

      .jss_tab:hover {
        background-color: #bdc3c7 !important;
      }

      .jss_tab.jss_tab_selected {
        background-color: #2c3e50 !important;
        color: #ffffff !important;
        border: 1px solid #1a252f !important;
        font-weight: 600 !important;
      }

      .jss_tab.jss_tab_selected:hover {
        background-color: #34495e !important;
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

          instanceRef.current = jspreadsheet(rootRef.current, config);

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
