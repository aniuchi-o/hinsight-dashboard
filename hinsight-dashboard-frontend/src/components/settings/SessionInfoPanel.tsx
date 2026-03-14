import { ISessionInfo } from '../../types/settings.types';
import { Shield, Clock, Globe } from 'lucide-react';

interface SessionInfoPanelProps {
    session: ISessionInfo;
}

const SessionInfoPanel = ({ session }: SessionInfoPanelProps) => {
    const sessionStart = new Date(session.sessionStartedAt);
    const durationMs = Date.now() - sessionStart.getTime();
    const durationMins = Math.floor(durationMs / 60000);
    const remainingMins = Math.max(0, session.sessionTimeoutMinutes - durationMins);

    return (
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
                <Clock size={14} className="text-brand mt-0.5 shrink-0" />
                <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Session started</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                        {sessionStart.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        {durationMins} min ago · Timeout in {remainingMins} min
                    </p>
                </div>
            </div>
            <div className="flex items-start gap-2">
                <Shield size={14} className="text-brand mt-0.5 shrink-0" />
                <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Session ID</p>
                    <p className="font-medium font-mono text-xs text-gray-800 dark:text-gray-200">
                        {session.sessionId.slice(0, 8)}···
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Audit log correlation</p>
                </div>
            </div>
            <div className="flex items-start gap-2">
                <Globe size={14} className="text-brand mt-0.5 shrink-0" />
                <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Data region</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                        {session.tenantRegion === 'CA' ? 'Canada — PHIPA compliant' : 'United States — HIPAA compliant'}
                    </p>
                    {session.ipRegion && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">Access from {session.ipRegion}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SessionInfoPanel;
