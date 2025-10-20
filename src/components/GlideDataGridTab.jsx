import React, { useCallback, useMemo, useState } from 'react';
import { DataEditor, GridCellKind } from '@glideapps/glide-data-grid';
import '@glideapps/glide-data-grid/dist/index.css';

const INITIAL_ROWS = 5;
const INITIAL_COLUMNS = 5;

// GitHub 예시에 따른 데이터 구조
const createEmptyGrid = (rows, columns) =>
    Array.from({ length: rows }, (_, rowIndex) => {
        const row = {};
        for (let colIndex = 0; colIndex < columns; colIndex += 1) {
            row[`col${colIndex + 1}`] = '';
        }
        return row;
    });

const GlideDataGridTab = () => {
    const [data, setData] = useState(() => createEmptyGrid(INITIAL_ROWS, INITIAL_COLUMNS));
    const [error, setError] = useState(null);

    // GitHub 예시에 따른 컬럼 정의
    const columns = useMemo(() => {
        const cols = data[0] ? Object.keys(data[0]).length : INITIAL_COLUMNS;
        return Array.from({ length: cols }, (_, index) => ({
            title: `Column ${index + 1}`,
            width: 150,
        }));
    }, [data]);

    // GitHub 예시에 따른 getCellContent 구현
    const getCellContent = useCallback((cell) => {
        const [col, row] = cell;
        const dataRow = data[row];
        
        if (!dataRow) {
            return {
                kind: GridCellKind.Text,
                allowOverlay: true,
                displayData: '',
                data: '',
            };
        }
        
        // 컬럼 키 배열 생성
        const columnKeys = Object.keys(dataRow);
        const field = columnKeys[col];
        const value = dataRow[field] || '';
        
        return {
            kind: GridCellKind.Text,
            allowOverlay: true,
            displayData: value,
            data: value,
            readonly: false,
        };
    }, [data]);

    // GitHub 예시에 따른 셀 편집 핸들러
    const handleCellEdited = useCallback((cell, newValue) => {
        const [col, row] = cell;
        console.log('Cell edited:', cell, newValue);
        
        setData(prev => {
            const newData = [...prev];
            if (!newData[row]) {
                return prev;
            }
            
            const columnKeys = Object.keys(newData[row]);
            const field = columnKeys[col];
            if (field) {
                newData[row] = {
                    ...newData[row],
                    [field]: newValue.data ?? newValue.displayData ?? '',
                };
            }
            return newData;
        });
    }, []);

    const addRow = () => {
        setData(prev => {
            const newRow = {};
            const columnKeys = prev[0] ? Object.keys(prev[0]) : [];
            columnKeys.forEach(key => {
                newRow[key] = '';
            });
            return [...prev, newRow];
        });
    };

    const deleteRow = () => {
        setData(prev => {
            if (prev.length <= 1) {
                return prev;
            }
            return prev.slice(0, -1);
        });
    };

    const addColumn = () => {
        setData(prev => {
            const newColIndex = prev[0] ? Object.keys(prev[0]).length + 1 : 1;
            const newField = `col${newColIndex}`;
            return prev.map(row => ({
                ...row,
                [newField]: '',
            }));
        });
    };

    const deleteColumn = () => {
        setData(prev => {
            if (prev.length === 0) return prev;
            const columnKeys = Object.keys(prev[0]);
            if (columnKeys.length <= 1) {
                return prev;
            }
            const lastField = columnKeys[columnKeys.length - 1];
            return prev.map(row => {
                const { [lastField]: _omitted, ...rest } = row;
                return rest;
            });
        });
    };

    if (error) {
        return (
            <div className="grid-wrapper">
                <div style={{ 
                    padding: '20px', 
                    color: 'red', 
                    border: '1px solid red', 
                    borderRadius: '4px', 
                    margin: '10px' 
                }}>
                    <h3>오류 발생</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid-wrapper">
            <div className="grid-controls">
                <button type="button" onClick={addRow}>
                    Add Row
                </button>
                <button type="button" onClick={deleteRow}>
                    Delete Row
                </button>
                <button type="button" onClick={addColumn}>
                    Add Column
                </button>
                <button type="button" onClick={deleteColumn}>
                    Delete Column
                </button>
            </div>
            <div className="grid-container">
                <DataEditor
                    getCellContent={getCellContent}
                    columns={columns}
                    rows={data.length}
                    onCellEdited={handleCellEdited}
                    height={420}
                    rowMarkers="both"
                    smoothScrollY
                    smoothScrollX
                />
            </div>
        </div>
    );
};

export default GlideDataGridTab;