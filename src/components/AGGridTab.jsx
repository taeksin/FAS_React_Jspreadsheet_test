import React, { useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const INITIAL_ROWS = 5;
const INITIAL_COLUMNS = 5;

const createColumnDefs = count =>
    Array.from({ length: count }, (_, index) => ({
        field: `col${index + 1}`,
        headerName: `Column ${index + 1}`,
        editable: true,
        sortable: true,
        filter: true,
        resizable: true,
    }));

const createRowData = (rows, columns) =>
    Array.from({ length: rows }, (_, rowIndex) => {
        const row = { id: rowIndex + 1 };
        for (let columnIndex = 0; columnIndex < columns; columnIndex += 1) {
            row[`col${columnIndex + 1}`] = '';
        }
        return row;
    });

const AGGridTab = () => {
    const [columnDefs, setColumnDefs] = useState(() => createColumnDefs(INITIAL_COLUMNS));
    const [rowData, setRowData] = useState(() =>
        createRowData(INITIAL_ROWS, INITIAL_COLUMNS)
    );
    const [error] = useState(null);

    const defaultColDef = useMemo(
        () => ({
            editable: true,
            flex: 1,
            resizable: true,
            sortable: true,
            filter: true,
        }),
        []
    );

    const addRow = () => {
        const newRow = { id: rowData.length + 1 };
        columnDefs.forEach(column => {
            newRow[column.field] = '';
        });
        setRowData(prev => [...prev, newRow]);
    };

    const deleteRow = () => {
        if (rowData.length <= 1) {
            return;
        }
        setRowData(prev => prev.slice(0, -1));
    };

    const addColumn = () => {
        const newIndex = columnDefs.length + 1;
        const field = `col${newIndex}`;
        const newColumn = {
            field,
            headerName: `Column ${newIndex}`,
            editable: true,
            sortable: true,
            filter: true,
            resizable: true,
        };
        
        setColumnDefs(prev => [...prev, newColumn]);
        
        setRowData(prev => prev.map(row => ({
            ...row,
            [field]: '',
        })));
    };

    const deleteColumn = () => {
        if (columnDefs.length <= 1) {
            return;
        }
        const removedField = columnDefs[columnDefs.length - 1].field;
        
        setColumnDefs(prev => prev.slice(0, -1));
        
        setRowData(prev => prev.map(row => {
            const { [removedField]: _omitted, ...rest } = row;
            return rest;
        }));
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
            <div
                className="ag-theme-alpine"
                style={{
                    height: 420,
                    width: '100%'
                }}
            >
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    stopEditingWhenCellsLoseFocus={false}
                    onCellValueChanged={(params) => {
                        console.log('Cell value changed:', params);
                    }}
                />
            </div>
        </div>
    );
};

export default AGGridTab;