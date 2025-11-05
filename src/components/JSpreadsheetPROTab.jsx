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
try { jspreadsheet.setLicense(LICENSE_KEY); } catch {}
jspreadsheet.setExtensions({ parser });

export default function JSpreadsheetPROTab() {
    const rootRef = useRef(null);
    const inputRef = useRef(null);
    const instanceRef = useRef(null);

    useEffect(() => {
        return () => {
            if (instanceRef.current && instanceRef.current.destroy) {
                try { instanceRef.current.destroy(); } catch {}
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
                        try { instanceRef.current.destroy(); } catch {}
                        instanceRef.current = null;
                    }
                    instanceRef.current = jspreadsheet(rootRef.current, config);
                } catch (err) {
                    alert(err?.message || 'Failed to open the XLSX file.');
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
        <>
            <div ref={rootRef}></div>
            <input
                ref={inputRef}
                id="file"
                type="file"
                name="file"
                accept=".xlsx,.xls"
                onChange={load}
                style={{ display: 'none' }}
            />
            <input
                type="button"
                value="파일 첨부"
                onClick={() => inputRef.current && inputRef.current.click()}
            />
        </>
    );
}


