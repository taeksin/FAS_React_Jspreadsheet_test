import React, { useState } from 'react';
import './App.css';
import ReactDataGridTab from './components/ReactDataGridTab.jsx';
import GlideDataGridTab from './components/GlideDataGridTab.jsx';
import MUIDataGridTab from './components/MUIDataGridTab.jsx';
import AGGridTab from './components/AGGridTab.jsx';
import TanstackDataGridTab from './components/TanstackDataGridTab.jsx';
import JSpreadsheetCE5Tab from './components/JSpreadsheetCE5Tab.jsx';
import JSpreadsheetCE5Tab_edit from './components/JSpreadsheetCE5Tab_edit.jsx';
import JSpreadsheetPROTab from './components/JSpreadsheetPROTab.jsx';

const tabs = [
    {
        id: 'reactdatagrid',
        label: 'React Data Grid',
        component: ReactDataGridTab,
    },
    {
        id: 'glide',
        label: 'Glide Data Grid',
        component: GlideDataGridTab,
    },
    {
        id: 'mui',
        label: 'MUI Data Grid',
        component: MUIDataGridTab,
    },
    {
        id: 'aggrid',
        label: 'AG Grid',
        component: AGGridTab,
    },
    {
        id: 'tanstack',
        label: 'Tanstack Data Grid',
        component: TanstackDataGridTab,
    },
    {
        id: 'jspreadsheet',
        label: 'JSpreadsheet CE',
        component: JSpreadsheetCE5Tab,
    },
    {
        id: 'jspreadsheet_edit',
        label: 'JSpreadsheet CE_EDIT',
        component: JSpreadsheetCE5Tab_edit,
    },
    {
        id: 'jspreadsheet_pro',
        label: 'JSpreadsheet PRO',
        component: JSpreadsheetPROTab,
    },
];

function App() {
    const [activeTab, setActiveTab] = useState(tabs[7].id);
    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

    return (
        <div className="App">
            <h1>스프레드시트 테스트</h1>
            <div className="tab-container">
                <div className="tab-buttons">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="tab-content">
                    {ActiveComponent ? <ActiveComponent /> : null}
                </div>
            </div>
        </div>
    );
}

export default App;
