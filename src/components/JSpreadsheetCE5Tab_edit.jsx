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
    // A=1, B=2 ... Z=26, AA=27 ...
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

// start, end: e.g., 'A1', 'B10'
// 반환: { A1: 'border-top: ...', ... }
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

    // Top border across left..right at row=top
    for (let c = left; c <= right; c += 1) {
        const key = `${colToLetters(c)}${top}`;
        addStyle(key, `border-top: ${width} solid ${color};`);
    }
    // Bottom border across left..right at row=bottom
    for (let c = left; c <= right; c += 1) {
        const key = `${colToLetters(c)}${bottom}`;
        addStyle(key, `border-bottom: ${width} solid ${color};`);
    }
    // Left border across top..bottom at col=left
    for (let r = top; r <= bottom; r += 1) {
        const key = `${colToLetters(left)}${r}`;
        addStyle(key, `border-left: ${width} solid ${color};`);
    }
    // Right border across top..bottom at col=right
    for (let r = top; r <= bottom; r += 1) {
        const key = `${colToLetters(right)}${r}`;
        addStyle(key, `border-right: ${width} solid ${color};`);
    }
    return style;
};

const JSpreadsheetCE5Tab = () => {
    const jssRef = useRef(null);
    const instanceRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (jssRef.current && !instanceRef.current) {
            jssRef.current.innerHTML = '';
            instanceRef.current = jspreadsheet(jssRef.current, {
                worksheets: [
                    {
                        // 샘플 데이터
                        data: [
                            ['Data1', 'Data2'],
                            ['Data3', 'Data4'],
                            ['Data5', 'Data6'],
                        ],
                        columns: [
                            { type: 'text', width: 120 },
                            { type: 'text', width: 120 },
                        ],
                        allowComments: true,
                        // 선택 영역 바깥쪽 테두리를 동적으로 생성
                        style: {
                            ...buildOuterBorderStyle('B1', 'B5', borderColor, '2px'),
                        },
                        minDimensions: [10, 10],
                    },
                ],
            });
        }

        return () => {
            if (instanceRef.current && typeof instanceRef.current.destroy === 'function') {
                try { instanceRef.current.destroy(); } catch (e) { /* noop */ }
            }
            instanceRef.current = null;
            if (jssRef.current) jssRef.current.innerHTML = '';
        };
    }, []);

    return (
        <div className="grid-wrapper">
            <div style={{ marginBottom: '10px' }}>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={async (e) => {
                        const file = e.target.files && e.target.files[0];
                        if (!file) return;
                        try {
                            const array = await file.arrayBuffer();
                            let XLSX = window.XLSX;
                            if (!XLSX) {
                                try { XLSX = await import('xlsx'); } catch (err) { console.error('XLSX 로드 실패', err); return; }
                            }
                            const wb = XLSX.read(array, { type: 'array', cellStyles: true });
                            const worksheets = (wb.SheetNames || []).map((name) => {
                                const ws = wb.Sheets[name];
                                const ref = ws['!ref'];
                                if (!ref) return { data: [['']], minDimensions: [10, 10] };
                                const range = XLSX.utils.decode_range(ref);
                                const rowCount = Math.max(10, range.e.r + 1);
                                const colCount = Math.max(10, range.e.c + 1);
                                const data = Array.from({ length: rowCount }, () => Array.from({ length: colCount }, () => ''));

                                // 셀 값 채우기 (절대좌표 유지)
                                Object.keys(ws)
                                .filter(k => /^(?:[A-Z]+)(?:\d+)$/.test(k))
                                .forEach(addr => {
                                    const cell = ws[addr];
                                    const c = XLSX.utils.decode_cell(addr);
                                    if (c.r < rowCount && c.c < colCount) {
                                    data[c.r][c.c] = (cell && (cell.w ?? cell.v)) ?? '';
                                    }
                                });


                                // 병합 처리: SheetJS '!merges' -> jspreadsheet mergeCells (절대좌표)
                                const mergeCells = {};
                                const merges = ws['!merges'] || [];
                                merges.forEach(m => {
                                    if (!m || !m.s || !m.e) return;

                                    // 절대좌표 그대로 사용
                                    const startCol = m.s.c + 1;
                                    const startRow = m.s.r + 1;
                                    const startAddr = `${colToLetters(startCol)}${startRow}`;

                                    const rows = (m.e.r - m.s.r) + 1;
                                    const cols = (m.e.c - m.s.c) + 1;

                                    if (rows > 1 || cols > 1) {
                                        mergeCells[startAddr] = [cols, rows];
                                    }
                                });


                                // 배경색 처리: 셀 스타일에서 fgColor를 읽어 background-color로 변환
                                const style = {};
                                const cellAddrs = Object.keys(ws).filter(k => /^(?:[A-Z]+)(?:\d+)$/.test(k));
                                cellAddrs.forEach(addr => {
                                    const cell = ws[addr];
                                    const fill = cell && cell.s && (cell.s.fill || cell.s.F || cell.s.patternType ? cell.s.fill : null);
                                    // fg 또는 bg 색상 시도
                                    const fg = fill && (fill.fgColor || fill.fgcolor || fill.fg || fill.bgColor || fill.bgcolor || fill.bg);
                                    let rgb = fg && (fg.rgb || fg.RGB);
                                    if (rgb) {
                                        const hex = rgb.length === 8 ? `#${rgb.slice(2)}` : `#${rgb.slice(-6)}`;
                                        const dc = XLSX.utils.decode_cell(addr);
                                        const rRel = dc.r - range.s.r + 1;
                                        const cRel = dc.c - range.s.c + 1;
                                        if (rRel >= 1 && rRel <= rowCount && cRel >= 1 && cRel <= colCount) {
                                            const dest = `${colToLetters(cRel)}${rRel}`;
                                            style[dest] = style[dest]
                                                ? `${style[dest]} background-color: ${hex};`
                                                : `background-color: ${hex};`;
                                        }
                                    }
                                });

                                const sheetConfig = { data, minDimensions: [colCount, rowCount] };
                                if (Object.keys(mergeCells).length) sheetConfig.mergeCells = mergeCells;
                                if (Object.keys(style).length) sheetConfig.style = style;
                                return sheetConfig;
                            });
                            if (!worksheets.length) return;

                            // 재생성
                            if (instanceRef.current && typeof instanceRef.current.destroy === 'function') {
                                try { instanceRef.current.destroy(); } catch (err) { /* noop */ }
                            }
                            if (jssRef.current) jssRef.current.innerHTML = '';
                            instanceRef.current = jspreadsheet(jssRef.current, {
                                worksheets,
                            });
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
