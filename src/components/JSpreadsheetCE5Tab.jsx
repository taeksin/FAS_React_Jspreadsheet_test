import React, { useEffect, useRef } from 'react';
import { jspreadsheet } from '@jspreadsheet-ce/react';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import 'jsuites/dist/jsuites.css';
import XlsxPopulate from 'xlsx-populate/browser/xlsx-populate';

// 컴포넌트 외부에서 한 번만 설정
jspreadsheet.setDictionary({
    // 행 관련
    'Insert a new row before': '위에 행 추가',
    'Insert a new row after': '아래에 행 추가',
    'Delete selected rows': '선택한 행 삭제',
    
    // 열 관련
    'Insert a new column before': '왼쪽에 열 추가',
    'Insert a new column after': '오른쪽에 열 추가',
    'Delete selected columns': '선택한 열 삭제',
    'Rename this column': '열 이름 변경',
    'Column name': '열 이름',
    'Order ascending': '오름차순 정렬(A-Z)',
    'Order descending': '내림차순 정렬(Z-A)',
    
    // 기본 작업
    'Copy...': '복사...',
    'Paste...': '붙여넣기...',
    'Save as...': '다른 이름으로 저장...',
    'About': '정보',
    
    // 코멘트
    'Edit comments': '코멘트 편집',
    'Add comments': '코멘트 추가',
    'Comments': '코멘트',
    'Clear comments': '코멘트 지우기',
    
    // 확인 메시지
    'Are you sure to delete the selected rows?': '선택한 행을 삭제하시겠습니까?',
    'Are you sure to delete the selected columns?': '선택한 열을 삭제하시겠습니까?',
    'No cells selected': '선택된 셀이 없습니다',
    'No records found': '레코드를 찾을 수 없습니다',
    
    // 검색 및 필터
    'Search': '검색',
    'Show': '표시',
    'entries': '항목',
    'Showing page {0} of {1} entries': '{1}개 항목 중 {0}페이지 표시',
    
    // 셀 병합
    'Merge the selected cells': '선택한 셀 병합',
    'There is a conflict with another merged cell': '다른 병합된 셀과 충돌이 있습니다',
    'Invalid merged properties': '잘못된 병합 속성',
    'Cell already merged': '이미 병합된 셀입니다',
    'This action will destroy any existing merged cells. Are you sure?': '이 작업은 기존 병합된 셀을 삭제합니다. 계속하시겠습니까?',
    'The merged cells will retain the value of the top-left cell only. Are you sure?': '병합된 셀은 왼쪽 상단 셀의 값만 유지합니다. 계속하시겠습니까?',
    'This action will clear your search results. Are you sure?': '이 작업은 검색 결과를 지웁니다. 계속하시겠습니까?'
});

// 테두리 색상
const borderColor = '#ff1e1e';

// 예: 'A1' -> { col: 1, row: 1 }
const parseRef = (ref) => {
    const match = String(ref).match(/([A-Za-z]+)(\d+)/);
    if (!match) return null;
    const [, colLetters, rowStr] = match;
    let col = 0;
    for (let i = 0; i < colLetters.length; i += 1) {
        col = col * 26 + (colLetters.charCodeAt(i) - 64);
    }
    const row = parseInt(rowStr, 10);
    return { col, row };
};

// 1 -> 'A', 27 -> 'AA'
const colToLetters = (n) => {
    let s = '';
    let x = n;
    while (x > 0) {
        const r = (x - 1) % 26;
        s = String.fromCharCode(65 + r) + s;
        x = Math.floor((x - 1) / 26);
    }
    return s;
};

// 외곽 테두리 생성
const buildOuterBorderStyle = (start, end, color = borderColor, width = '2px') => {
    const a = parseRef(start);
    const b = parseRef(end);
    if (!a || !b) return {};
    const top = Math.min(a.row, b.row);
    const bottom = Math.max(a.row, b.row);
    const left = Math.min(a.col, b.col);
    const right = Math.max(a.col, b.col);
    const style = {};
    const addStyle = (addr, fragment) => {
        style[addr] = style[addr] ? `${style[addr]} ${fragment}` : fragment;
    };
    for (let c = left; c <= right; c++) addStyle(`${colToLetters(c)}${top}`, `border-top: ${width} solid ${color};`);
    for (let c = left; c <= right; c++) addStyle(`${colToLetters(c)}${bottom}`, `border-bottom: ${width} solid ${color};`);
    for (let r = top; r <= bottom; r++) addStyle(`${colToLetters(left)}${r}`, `border-left: ${width} solid ${color};`);
    for (let r = top; r <= bottom; r++) addStyle(`${colToLetters(right)}${r}`, `border-right: ${width} solid ${color};`);
    return style;
};

const JSpreadsheetCE5Tab = () => {
    const jssRef = useRef(null);
    const instanceRef = useRef(null);
    const fileInputRef = useRef(null);
    const [activeSheet, setActiveSheet] = React.useState(0); // ✅ 현재 선택된 시트 index

    useEffect(() => {
        if (jssRef.current && !instanceRef.current) {
            jssRef.current.innerHTML = '';
            instanceRef.current = jspreadsheet(jssRef.current, {
                worksheets: [
                    {
                        data: [['Data1', 'Data2'], ['Data3', 'Data4'], ['Data5', 'Data6']],
                        columns: [{ type: 'text', width: 120 }, { type: 'text', width: 120 }],
                        allowComments: true,
                        style: { ...buildOuterBorderStyle('B1', 'B5', borderColor, '2px') },
                        minDimensions: [10, 10],
                    },
                ],
            });
        }
        return () => {
            if (instanceRef.current?.destroy) {
                try { instanceRef.current.destroy(); } catch {}
            }
            instanceRef.current = null;
            if (jssRef.current) jssRef.current.innerHTML = '';
        };
    }, []);

    const renderSheet = (worksheets, index) => {
        if (!worksheets[index]) return;
        if (instanceRef.current?.destroy) {
            try { instanceRef.current.destroy(); } catch {}
        }
        jssRef.current.innerHTML = '';
        instanceRef.current = jspreadsheet(jssRef.current, { worksheets: [worksheets[index]] });
    };

    return (
        <div className="grid-wrapper">
            <div style={{ marginBottom: '10px' }}>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                            const array = await file.arrayBuffer();
                            let XLSX = window.XLSX || (await import('xlsx'));
                            const wb = XLSX.read(array, { type: 'array', cellStyles: true });

                            // ✅ 모든 시트 읽기
                            const worksheets = [];
                            for (const name of wb.SheetNames) {
                                const ws = wb.Sheets[name];
                                const ref = ws['!ref'];
                                const range = XLSX.utils.decode_range(ref);
                                const rowCount = Math.max(10, range.e.r + 1);
                                const colCount = Math.max(10, range.e.c + 1);
                                const data = Array.from({ length: rowCount }, () => Array(colCount).fill(''));

                                Object.keys(ws)
                                    .filter(k => /^[A-Z]+\d+$/.test(k))
                                    .forEach(addr => {
                                        const cell = ws[addr];
                                        const c = XLSX.utils.decode_cell(addr);
                                        data[c.r][c.c] = (cell && (cell.w ?? cell.v)) ?? '';
                                    });

                                const mergeCells = {};
                                (ws['!merges'] || []).forEach(m => {
                                    const startCol = m.s.c + 1;
                                    const startRow = m.s.r + 1;
                                    const startAddr = `${colToLetters(startCol)}${startRow}`;
                                    const rows = (m.e.r - m.s.r) + 1;
                                    const cols = (m.e.c - m.s.c) + 1;
                                    if (rows > 1 || cols > 1) mergeCells[startAddr] = [cols, rows];
                                });

                                const workbook = await XlsxPopulate.fromDataAsync(array);
                                const sheet = workbook.sheet(name);
                                const style = {};
                                sheet._rows.forEach((row, rIdx) => {
                                    row._cells?.forEach((cell, cIdx) => {
                                        if (!cell) return;
                                        const fill = cell.style('fill');
                                        let colorHex = null;
                                        if (fill && typeof fill.color === 'function') {
                                            const colorObj = fill.color();
                                            if (colorObj?.rgb) colorHex = `#${colorObj.rgb.slice(-6)}`;
                                        } else if (fill?.color && typeof fill.color === 'object' && fill.color.rgb) {
                                            colorHex = `#${fill.color.rgb.slice(-6)}`;
                                        } else if (typeof fill?.color === 'string' && /^#?[0-9A-Fa-f]{6,8}$/.test(fill.color)) {
                                            colorHex = fill.color.startsWith('#') ? fill.color : `#${fill.color.slice(-6)}`;
                                        }
                                        if (colorHex) {
                                            const addr = `${colToLetters(cIdx)}${rIdx}`;
                                            style[addr] = (style[addr] ?? '') + `background-color: ${colorHex};`;
                                        }
                                    });
                                });

                                const sheetConfig = { data, minDimensions: [colCount, rowCount] };
                                if (Object.keys(mergeCells).length) sheetConfig.mergeCells = mergeCells;
                                if (Object.keys(style).length) sheetConfig.style = style;
                                worksheets.push({ ...sheetConfig, worksheetName: name });
                            }

                            // ✅ 시트 전환 UI 렌더링
                            setActiveSheet(0);
                            renderSheet(worksheets, 0);

                            // ✅ 시트 탭 버튼 렌더링
                            const tabContainer = document.createElement('div');
                            tabContainer.style.marginBottom = '8px';
                            tabContainer.style.display = 'flex';
                            tabContainer.style.gap = '6px';

                            worksheets.forEach((sheet, idx) => {
                                const btn = document.createElement('button');
                                btn.innerText = sheet.worksheetName || `Sheet${idx + 1}`;
                                btn.style.padding = '4px 8px';
                                btn.style.cursor = 'pointer';
                                btn.style.border = idx === 0 ? '2px solid #007bff' : '1px solid #ccc';
                                btn.style.background = idx === 0 ? '#e8f0ff' : '#fff';
                                btn.onclick = () => {
                                    setActiveSheet(idx);
                                    renderSheet(worksheets, idx);
                                    Array.from(tabContainer.children).forEach((b, i) => {
                                        b.style.border = i === idx ? '2px solid #007bff' : '1px solid #ccc';
                                        b.style.background = i === idx ? '#e8f0ff' : '#fff';
                                    });
                                };
                                tabContainer.appendChild(btn);
                            });

                            if (jssRef.current.parentElement) {
                                jssRef.current.parentElement.insertBefore(tabContainer, jssRef.current);
                            }
                        } catch (err) {
                            console.error('파일 처리 실패', err);
                        } finally {
                            if (fileInputRef.current) fileInputRef.current.value = '';
                        }
                    }}
                />
            </div>
            <div ref={jssRef} />
        </div>
    );
};

export default JSpreadsheetCE5Tab;
