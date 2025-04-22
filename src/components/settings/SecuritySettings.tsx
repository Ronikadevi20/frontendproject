import { DecoyMode } from './DecoyMode';
import { DeviceHistory } from './DeviceHistory';
import { DangerZone } from './DangerZone';

export const SecuritySettings = ({
    settings,
    deviceHistory,
    handleAccountDeletion,
}: {
    settings: UserSettings;
    deviceHistory: any[];
    handleAccountDeletion: () => void;
}) => (
    <div className="space-y-8">
        <DeviceHistory devices={deviceHistory} />
        <DecoyMode settings={settings} />
        <div>
            
        </div>
        <DangerZone onDelete={handleAccountDeletion} />
    </div>
);