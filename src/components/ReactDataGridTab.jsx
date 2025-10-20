import React, { useMemo, useState } from 'react';
import { DataGrid } from 'react-data-grid';

const INITIAL_ROWS = 5;
const INITIAL_COLUMNS = 5;

const createEmptyGrid = (rows, columns) =>
    Array.from({ length: rows }, (_, rowIndex) => {
        const row = { id: rowIndex + 1 };
        for (let colIndex = 0; colIndex < columns; colIndex += 1) {
            row[`col${colIndex + 1}`] = '';
        }
        return row;
    });

const ReactDataGridTab = () => {
    const [data, setData] = useState(() => createEmptyGrid(INITIAL_ROWS, INITIAL_COLUMNS));
    const [error, setError] = useState(null);

    const columns = useMemo(() => {
        const cols = data[0] ? Object.keys(data[0]).length - 1 : INITIAL_COLUMNS; // id 제외
        return Array.from({ length: cols }, (_, index) => ({
            key: `col${index + 1}`,
            name: `Column ${index + 1}`,
            editable: true,
            resizable: true,
        }));
    }, [data]);

    const addRow = () => {
        setData(prev => {
            const newRow = { id: prev.length + 1 };
            const columnKeys = Object.keys(prev[0] || {}).filter(key => key !== 'id');
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
            const newColIndex = prev[0] ? Object.keys(prev[0]).length - 1 : 1; // id 제외
            const newField = `col${newColIndex + 1}`;
            return prev.map(row => ({
                ...row,
                [newField]: '',
            }));
        });
    };

    const deleteColumn = () => {
        setData(prev => {
            if (prev.length === 0) return prev;
            const columnKeys = Object.keys(prev[0]).filter(key => key !== 'id');
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

    const handleRowsChange = (rows) => {
        setData(rows);
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
                <DataGrid
                    columns={columns}
                    rows={data}
                    onRowsChange={handleRowsChange}
                    style={{ 
                        height: 420,
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                    }}
                />
            </div>
        </div>
    );
};

export default ReactDataGridTab;
