import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

const AIFeatures = ({ settings }) => {
    return (
        <section className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4">AI Features</h3>
            <div className="space-y-6">
                {['auto_categorization', 'security_recommendations', 'password_analysis'].map((feature) => (
                    <div className="flex items-center justify-between" key={feature}>
                        <Label>{feature.replace('_', ' ').toUpperCase()}</Label>
                        <Switch checked={settings[feature]} onCheckedChange={(checked) => {/* logic */ }} />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default AIFeatures;