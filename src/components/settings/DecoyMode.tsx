import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Input } from '../ui/input';


const DecoyMode = () => {
    return (
        <section className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4">Decoys Mode</h3>
            <div className="flex items-center justify-between">
                <Label>Enable Decoy Mode</Label>
                <Switch checked={false} onCheckedChange={(enabled) => {/* logic */ }} />
            </div>
            <div className="space-y-2 mt-4">
                <Label>Decoy Password</Label>
                <Input type="password" />
            </div>
        </section>
    );
};

export default DecoyMode;