import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useSyncUnreadCount } from '../../hooks/useAlerts';
import { useDashboardData } from '../../hooks/useDashboardData';
import { applyDashboardDataToMock } from '../../utils/mockDashboardData';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const PATH_TO_VIEW: Record<string, string> = {
    '/overview': 'overview',
    '/lifestyle': 'lifestyle',
    '/nutrition-obesity': 'nutrition-obesity',
    '/feelings': 'feelings',
};

const DashboardShell = () => {
    const location = useLocation();
    const [dataVersion, setDataVersion] = useState(0);
    const activeView = PATH_TO_VIEW[location.pathname] ?? 'overview';

    // Global keyboard shortcuts active on every authenticated page
    useKeyboardShortcuts();
    // Keep bell badge in sync regardless of which page is active
    useSyncUnreadCount();

    const { data } = useDashboardData(activeView);

    useEffect(() => {
        if (!data) return;
        applyDashboardDataToMock(data);
        setDataVersion((version) => version + 1);
    }, [data]);

    return (
        <div className="flex flex-col h-screen bg-[#E8E9F0] dark:bg-[#1A1B2E] overflow-hidden">
            {/* Global top bar — spans full width */}
            <TopBar />

            {/* Sidebar + content */}
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />

                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Page content */}
                    <main key={dataVersion} className="flex-1 overflow-y-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DashboardShell;
