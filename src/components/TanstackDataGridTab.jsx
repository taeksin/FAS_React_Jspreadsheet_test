import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    createColumnHelper,
    flexRender,
} from '@tanstack/react-table';
// 가상화는 정확한 컬럼 정렬을 위해 비활성화 (단일 테이블 렌더링)

const INITIAL_ROWS = 5;
const INITIAL_COLUMNS = 5;
const SELECT_COL_WIDTH = 60; // No column width
const DATA_COL_WIDTH = 160; // Data column width

const TanstackDataGridTab = () => {
    const [data, setData] = useState(() => {
        const grid = [];
        for (let row = 0; row < INITIAL_ROWS; row++) {
            const rowData = { id: row };
            for (let col = 0; col < INITIAL_COLUMNS; col++) {
                rowData[`col${col}`] = `${row + 1}행 ${col + 1}열`;
            }
            grid.push(rowData);
        }
        return grid;
    });
    
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [selectedCols, setSelectedCols] = useState(new Set());
    const [insertRowIndex, setInsertRowIndex] = useState('');
    const [insertColIndex, setInsertColIndex] = useState('');
    const [columnOrder, setColumnOrder] = useState(() => {
        const cols = [];
        for (let i = 0; i < INITIAL_COLUMNS; i++) {
            cols.push(`col${i}`);
        }
        return cols;
    });

    // 가상화를 위한 ref
    const tableContainerRef = useRef(null);
    // 헤더 및 셀 위치 참조
    const headerWrapperRef = useRef(null);
    const headerCellRefs = useRef([]);
    // 헤더 및 셀 위치 계산용 refs

    // 테이블 컬럼 순서: 행 인덱스('No')를 항상 가장 왼쪽에 고정
    const tableColumnOrder = useMemo(() => [
        'select',
        ...columnOrder,
    ], [columnOrder]);

    const getColumnCount = () => {
        return data.length > 0 ? Object.keys(data[0]).filter(key => key !== 'id').length : 0;
    };

    const columnHelper = createColumnHelper();

    const columns = useMemo(() => {
        const cols = [
            columnHelper.display({
                id: 'select',
                header: 'No',
                cell: ({ row }) => (
                    <button
                        onClick={() => handleRowSelect(row.index)}
                        style={{
                            width: '100%',
                            backgroundColor: selectedRows.has(row.index) ? '#ffeb3b' : '#f5f5f5',
                            border: '0px solid #ddd',
                            padding: '4px 8px',
                            cursor: 'pointer',
                        }}
                    >
                        {row.index + 1}
                    </button>
                ),
                size: SELECT_COL_WIDTH,
            })
        ];

        columnOrder.forEach((colKey, colIndex) => {
            cols.push(
                columnHelper.accessor(colKey, {
                    header: ({ column }) => (
                        <button
                            onClick={() => handleColSelect(colIndex)}
                            style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: selectedCols.has(colIndex) ? '#ffeb3b' : '#f5f5f5',
                                border: '1px solid #ddd',
                                // padding: '0px 0px',
                                cursor: 'pointer',
                            }}
                        >
                            Col {colIndex + 1}
                        </button>
                    ),
                    cell: ({ getValue, row, column }) => (
                        <input
                            type="text"
                            value={getValue() || ''}
                            onChange={(e) => handleCellChange(row.index, column.id, e.target.value)}
                            style={{
                                width: '100%',
                                border: 'none',
                                padding: '4px',
                                outline: 'none',
                                backgroundColor: 'transparent'
                            }}
                        />
                    ),
                    size: DATA_COL_WIDTH,
                })
            );
        });

        return cols;
    }, [columnOrder, selectedRows, selectedCols]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            columnOrder: tableColumnOrder,
        },
        // 외부에서 컬럼 순서 변경은 허용하지 않음( '#' 고정 )
    });

    // 단일 테이블에서 행 위치 계산을 위한 refs
    const rowRefs = useRef({});

    // 단일 선택 인덱스 (플로팅 버튼 표시 조건)
    const singleSelectedRowIndex = selectedRows.size === 1 ? [...selectedRows][0] : null;
    const singleSelectedColIndex = selectedCols.size === 1 ? [...selectedCols][0] : null;

    // 단일 선택 인덱스 (버튼 표시 시 사용)

    const handleCellChange = useCallback((rowIndex, colKey, value) => {
        setData(prev => {
            const newData = [...prev];
            newData[rowIndex] = {
                ...newData[rowIndex],
                [colKey]: value
            };
            return newData;
        });
    }, []);

    const handleRowSelect = (rowIndex) => {
        setSelectedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(rowIndex)) {
                newSet.delete(rowIndex);
            } else {
                newSet.add(rowIndex);
            }
            return newSet;
        });
    };

    const handleColSelect = (colIndex) => {
        setSelectedCols(prev => {
            const newSet = new Set(prev);
            if (newSet.has(colIndex)) {
                newSet.delete(colIndex);
            } else {
                newSet.add(colIndex);
            }
            return newSet;
        });
    };

    const deleteSelectedRows = () => {
        if (selectedRows.size === 0) return;
        
        setData(prev => {
            const newData = prev.filter((_, index) => !selectedRows.has(index));
            return newData.map((row, index) => ({ ...row, id: index }));
        });
        setSelectedRows(new Set());
    };

    const deleteSelectedCols = () => {
        if (selectedCols.size === 0) return;
        
        const colsToDelete = Array.from(selectedCols).map(index => columnOrder[index]);
        
        setData(prev => {
            return prev.map(row => {
                const newRow = { ...row };
                colsToDelete.forEach(key => delete newRow[key]);
                return newRow;
            });
        });
        
        setColumnOrder(prev => prev.filter((_, index) => !selectedCols.has(index)));
        setSelectedCols(new Set());
    };

    // 플로팅 버튼 조작용 헬퍼
    const insertRowAtIndex = useCallback((index) => {
        if (index < 0 || index > data.length) return;
        setData(prev => {
            const newRow = { id: index };
            columnOrder.forEach(key => { newRow[key] = ''; });
            const next = [...prev];
            next.splice(index, 0, newRow);
            return next.map((r, i) => ({ ...r, id: i }));
        });
        // 삽입 후 선택 해제
        setSelectedRows(new Set());
    }, [data.length, columnOrder]);

    const deleteRowAtIndex = useCallback((index) => {
        if (index < 0 || index >= data.length) return;
        setData(prev => prev.filter((_, i) => i !== index).map((r, i) => ({ ...r, id: i })));
        setSelectedRows(new Set());
    }, [data.length]);

    const insertColAtIndex = useCallback((index) => {
        if (index < 0 || index > columnOrder.length) return;
        const newColKey = `col${Date.now()}`;
        setData(prev => prev.map(row => ({ ...row, [newColKey]: '' })));
        setColumnOrder(prev => {
            const next = [...prev];
            next.splice(index, 0, newColKey);
            return next;
        });
        // 열 추가 후 선택 해제
        setSelectedCols(new Set());
    }, [columnOrder.length]);

    const deleteColAtIndex = useCallback((index) => {
        if (index < 0 || index >= columnOrder.length) return;
        const key = columnOrder[index];
        setData(prev => prev.map(row => { const n = { ...row }; delete n[key]; return n; }));
        setColumnOrder(prev => prev.filter((_, i) => i !== index));
        setSelectedCols(new Set());
    }, [columnOrder]);

    // (중복 방지) 단일 인덱스 조작 함수는 위에서만 정의

    const insertRowAt = () => {
        const index = parseInt(insertRowIndex);
        if (isNaN(index) || index < 0 || index > data.length) return;
        
        setData(prev => {
            const newRow = { id: index };
            columnOrder.forEach(key => {
                newRow[key] = '';
            });
            
            const newData = [...prev];
            newData.splice(index, 0, newRow);
            
            return newData.map((row, index) => ({ ...row, id: index }));
        });
        setInsertRowIndex('');
    };

    const insertColAt = () => {
        const index = parseInt(insertColIndex);
        if (isNaN(index) || index < 0 || index > columnOrder.length) return;
        
        const newColKey = `col${Date.now()}`;
        
        setData(prev => {
            return prev.map(row => ({
                ...row,
                [newColKey]: ''
            }));
        });
        
        setColumnOrder(prev => {
            const newOrder = [...prev];
            newOrder.splice(index, 0, newColKey);
            return newOrder;
        });
        setInsertColIndex('');
    };

    const addRow = () => {
        setData(prev => {
            const newRow = { id: prev.length };
            columnOrder.forEach(key => {
                newRow[key] = '';
            });
            return [...prev, newRow];
        });
    };

    const addCol = () => {
        const newColKey = `col${Date.now()}`;
        setData(prev => {
            return prev.map(row => ({
                ...row,
                [newColKey]: ''
            }));
        });
        setColumnOrder(prev => [...prev, newColKey]);
    };

    return (
        <div className="grid-wrapper">
            <div className="grid-controls">
                <div style={{ marginBottom: '10px' }}>
                    <h4>행 관리</h4>
                    <button type="button" onClick={addRow}>
                        행 추가 (맨 아래)
                    </button>
                    <button type="button" onClick={deleteSelectedRows} disabled={selectedRows.size === 0}>
                        선택된 행 삭제 ({selectedRows.size}개)
                    </button>
                    <div style={{ marginTop: '5px' }}>
                        <input
                            type="number"
                            placeholder="행 삽입 위치"
                            value={insertRowIndex}
                            onChange={(e) => setInsertRowIndex(e.target.value)}
                            style={{ width: '120px', marginRight: '5px' }}
                        />
                        <button type="button" onClick={insertRowAt}>
                            해당 위치에 행 삽입
                        </button>
                    </div>
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                    <h4>열 관리</h4>
                    <button type="button" onClick={addCol}>
                        열 추가 (맨 오른쪽)
                    </button>
                    <button type="button" onClick={deleteSelectedCols} disabled={selectedCols.size === 0}>
                        선택된 열 삭제 ({selectedCols.size}개)
                    </button>
                    <div style={{ marginTop: '5px' }}>
                        <input
                            type="number"
                            placeholder="열 삽입 위치"
                            value={insertColIndex}
                            onChange={(e) => setInsertColIndex(e.target.value)}
                            style={{ width: '120px', marginRight: '5px' }}
                        />
                        <button type="button" onClick={insertColAt}>
                            해당 위치에 열 삽입
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="grid-container" ref={tableContainerRef} style={{ overflow: 'auto', maxHeight: '500px', position: 'relative' }}>
                <div ref={headerWrapperRef} style={{ position: 'relative' }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '600px', tableLayout: 'fixed' }}>
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header, headerIdx) => {
                                        const isSelectCol = headerIdx === 0; // '#' column
                                        const dataColIdx = isSelectCol ? -1 : headerIdx - 1;
                                        return (
                                            <th
                                                key={header.id}
                                                ref={!isSelectCol ? (el) => { headerCellRefs.current[dataColIdx] = el; } : undefined}
                                                style={{
                                                    padding: '1px',
                                                    backgroundColor: '#f5f5f5',
                                                    width: header.getSize(),
                                                    height: '100%',
                                                    position: 'sticky',
                                                    top: 0,
                                                    zIndex: 1,
                                                }}
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </th>
                                        );
                                    })}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} ref={(el) => { if (el) rowRefs.current[row.index] = el; }}>
                                    {row.getVisibleCells().map(cell => (
                                        <td
                                            key={cell.id}
                                            style={{
                                                border: '1px solid #ddd',
                                                padding: '0',
                                                width: cell.column.getSize(),
                                                minWidth: cell.column.getSize(),
                                            }}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {singleSelectedColIndex !== null && headerCellRefs.current[singleSelectedColIndex] ? (() => {
                        const el = headerCellRefs.current[singleSelectedColIndex];
                        const top = Math.max(4, (el.offsetTop || 0) - 36);
                        const left = el.offsetLeft + (el.offsetWidth / 2);
                        return (
                            <div
                                style={{
                                    position: 'absolute',
                                    top,
                                    left,
                                    transform: 'translateX(-50%)',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    gap: 8,
                                    zIndex: 3,
                                }}
                            >
                                <button type="button" onClick={() => insertColAtIndex(singleSelectedColIndex)} title="선택 열 왼쪽에 추가">+</button>
                                <button type="button" onClick={() => deleteColAtIndex(singleSelectedColIndex)} title="선택 열 삭제">-</button>
                                <button type="button" onClick={() => insertColAtIndex(singleSelectedColIndex + 1)} title="선택 열 오른쪽에 추가">+</button>
                            </div>
                        );
                    })() : null}

                    {singleSelectedRowIndex !== null && rowRefs.current[singleSelectedRowIndex] && tableContainerRef.current ? (() => {
                        const rowEl = rowRefs.current[singleSelectedRowIndex];
                        const container = tableContainerRef.current;
                        const rowTop = rowEl.offsetTop - container.scrollTop;
                        const rowHeight = rowEl.offsetHeight;
                        const top = Math.max(4, rowTop + (rowHeight / 2) - 42);
                        return (
                            <div
                                style={{
                                    position: 'absolute',
                                    top,
                                    left: 6,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 8,
                                    zIndex: 4,
                                }}
                            >
                                <button type="button" onClick={() => insertRowAtIndex(singleSelectedRowIndex)} title="선택 행 위에 추가">+</button>
                                <button type="button" onClick={() => deleteRowAtIndex(singleSelectedRowIndex)} title="선택 행 삭제">-</button>
                                <button type="button" onClick={() => insertRowAtIndex(singleSelectedRowIndex + 1)} title="선택 행 아래에 추가">+</button>
                            </div>
                        );
                    })() : null}
                </div>
            </div>
        </div>
    );
};

export default TanstackDataGridTab;
