import React, { useCallback, useRef, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/material';

const INITIAL_ROWS = 5;
const INITIAL_COLUMNS = 5;

const createColumns = count => [
    {
        field: 'id',
        headerName: '#',
        width: 60,
        editable: false,
        sortable: false,
        filterable: false,
    },
    ...Array.from({ length: count }, (_, index) => ({
        field: `col${index + 1}`,
        headerName: `Column ${index + 1}`,
        flex: 1,
        editable: true,
    }))
];

const createRows = (rowCount, columnCount) =>
    Array.from({ length: rowCount }, (_, rowIndex) => {
        const row = { id: rowIndex + 1 };
        for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
            row[`col${columnIndex + 1}`] = '';
        }
        return row;
    });

const MUIDataGridTab = () => {
    const [columns, setColumns] = useState(() => createColumns(INITIAL_COLUMNS));
    const [rows, setRows] = useState(() => createRows(INITIAL_ROWS, INITIAL_COLUMNS));
    const [error, setError] = useState(null);
    const nextRowIdRef = useRef(INITIAL_ROWS + 1);

    const processRowUpdate = useCallback(newRow => {
        setRows(prevRows =>
            prevRows.map(row => (row.id === newRow.id ? newRow : row))
        );
        return newRow;
    }, []);

    const addRow = () => {
        const newRowId = nextRowIdRef.current;
        nextRowIdRef.current += 1;
        setRows(prevRows => {
            const newRow = { id: newRowId };
            columns.forEach(column => {
                if (column.field !== 'id') {
                    newRow[column.field] = '';
                }
            });
            return [...prevRows, newRow];
        });
    };

    const deleteRow = () => {
        setRows(prevRows => {
            if (prevRows.length <= 1) {
                return prevRows;
            }
            return prevRows.slice(0, -1);
        });
    };

    const addColumn = () => {
        setColumns(prevColumns => {
            const newIndex = prevColumns.length;
            const field = `col${newIndex + 1}`;
            const newColumn = {
                field,
                headerName: `Column ${newIndex + 1}`,
                flex: 1,
                editable: true,
            };
            setRows(prevRows =>
                prevRows.map(row => ({
                    ...row,
                    [field]: '',
                }))
            );
            return [...prevColumns, newColumn];
        });
    };

    const deleteColumn = () => {
        setColumns(prevColumns => {
            if (prevColumns.length <= 2) {
                return prevColumns;
            }
            const removed = prevColumns[prevColumns.length - 1];
            const { field } = removed;
            setRows(prevRows =>
                prevRows.map(row => {
                    const { [field]: _omitted, ...rest } = row;
                    return rest;
                })
            );
            return prevColumns.slice(0, -1);
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
                <Box sx={{ height: 420, width: '100%' }}>
                    <DataGrid
                        columns={columns}
                        rows={rows}
                        processRowUpdate={processRowUpdate}
                        onProcessRowUpdateError={error => {
                            console.error(error);
                        }}
                        disableRowSelectionOnClick
                        hideFooter
                        editMode="cell"
                        rowHeight={52}
                        columnHeaderHeight={56}
                        sx={{
                            height: 420,
                            border: 'none',
                            '& .MuiDataGrid-cell:focus': {
                                outline: 'none',
                            },
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: '#f5f5f5',
                            },
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#f8f9fa',
                                fontWeight: 'bold',
                            }
                        }}
                    />
                </Box>
            </div>
        </div>
    );
};

export default MUIDataGridTab;