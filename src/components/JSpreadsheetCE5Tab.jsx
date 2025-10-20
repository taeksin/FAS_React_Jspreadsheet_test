import React, { useEffect, useRef, useState } from 'react';
import { jspreadsheet } from '@jspreadsheet-ce/react';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import 'jsuites/dist/jsuites.css';


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

const borderColor = '#ff1e1e';

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
    for (let c = left; c <= right; c += 1)
        addStyle(`${colToLetters(c)}${top}`, `border-top: ${width} solid ${color};`);
    for (let c = left; c <= right; c += 1)
        addStyle(`${colToLetters(c)}${bottom}`, `border-bottom: ${width} solid ${color};`);
    for (let r = top; r <= bottom; r += 1)
        addStyle(`${colToLetters(left)}${r}`, `border-left: ${width} solid ${color};`);
    for (let r = top; r <= bottom; r += 1)
        addStyle(`${colToLetters(right)}${r}`, `border-right: ${width} solid ${color};`);
    return style;
};

const JSpreadsheetCE5Tab = () => {
    const jssRef = useRef(null);
    const instanceRef = useRef(null);
    const [size, setSize] = useState({ width: 700, height: 400 });
    const [resizing, setResizing] = useState(null);
    const [isReady, setIsReady] = useState(false);

    const updateTableSize = () => {
        if (!instanceRef.current || !isReady) return;
        const sheet = instanceRef.current[0];
        if (!sheet) return;
        const visibleCols = Math.max(2, Math.floor(size.width / 120));
        const visibleRows = Math.max(5, Math.floor(size.height / 30));
        const newData = [];
        for (let r = 0; r < visibleRows; r++) {
            const row = [];
            for (let c = 0; c < visibleCols; c++) {
                row.push(sheet.options.data[r]?.[c] || '');
            }
            newData.push(row);
        }
        sheet.setData(newData);
    };

    useEffect(() => {
        if (jssRef.current && !instanceRef.current) {
            jssRef.current.innerHTML = '';
            instanceRef.current = jspreadsheet(jssRef.current, {
                worksheets: [
                    {
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
                        style: {
                            ...buildOuterBorderStyle('B1', 'B9', borderColor, '2px'),
                        },
                        minDimensions: [10, 10],
                        onload: () => setIsReady(true),
                    },
                ],
            });
        }
        return () => {
            if (instanceRef.current?.destroy) instanceRef.current.destroy();
            instanceRef.current = null;
            if (jssRef.current) jssRef.current.innerHTML = '';
        };
    }, []);

    // ✅ 리사이즈 이벤트
    useEffect(() => {
        const handleMove = (e) => {
            if (!resizing) return;
            const wrapper = document.querySelector('.grid-wrapper');
            if (!wrapper) return;
            const rect = wrapper.getBoundingClientRect();

            if (resizing === 'right') {
                setSize((prev) => ({
                    ...prev,
                    width: Math.max(300, e.clientX - rect.left),
                }));
            } else if (resizing === 'bottom') {
                setSize((prev) => ({
                    ...prev,
                    height: Math.max(200, e.clientY - rect.top),
                }));
            } else if (resizing === 'corner') {
                // ✅ 대각선 리사이즈
                setSize({
                    width: Math.max(300, e.clientX - rect.left),
                    height: Math.max(200, e.clientY - rect.top),
                });
            }
        };
        const stop = () => setResizing(null);
        if (resizing) {
            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', stop);
        }
        return () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', stop);
        };
    }, [resizing]);

    useEffect(() => {
        updateTableSize();
    }, [size]);

    return (
        <div
            className="grid-wrapper"
            style={{
                position: 'relative',
                width: `${size.width}px`,
                height: `${size.height}px`,
                border: '1px solid #ccc',
                overflow: 'hidden',
            }}
        >
            <div ref={jssRef} style={{ width: '100%', height: '100%' }} />

            {/* 오른쪽 리사이즈 핸들 */}
            <div
                onMouseDown={() => setResizing('right')}
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '6px',
                    height: '100%',
                    cursor: 'ew-resize',
                }}
            />

            {/* 아래쪽 리사이즈 핸들 */}
            <div
                onMouseDown={() => setResizing('bottom')}
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '6px',
                    cursor: 'ns-resize',
                }}
            />

            {/* ✅ 대각선 리사이즈 핸들 (↘ 모서리) */}
            <div
                onMouseDown={() => setResizing('corner')}
                style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '12px',
                    height: '12px',
                    cursor: 'nwse-resize',
                    background: 'transparent',
                }}
            />
        </div>
    );
};

export default JSpreadsheetCE5Tab;