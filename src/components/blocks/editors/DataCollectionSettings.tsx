import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ClipboardList } from 'lucide-react';

export interface DataCollectionConfig {
  data_gate_enabled?: boolean;
  collect_name?: boolean;
  collect_email?: boolean;
  collect_phone?: boolean;
}

interface DataCollectionSettingsProps {
  config: DataCollectionConfig;
  onChange: (config: DataCollectionConfig) => void;
}

export default function DataCollectionSettings({ config, onChange }: DataCollectionSettingsProps) {
  const isEnabled = config.data_gate_enabled ?? false;

  return (
    <div className="space-y-3 p-4 bg-secondary/50 rounded-xl border border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary" />
          <div>
            <p className="text-sm font-medium">Collect Visitor Data</p>
            <p className="text-xs text-muted-foreground">
              Require info before accessing this block (one-time)
            </p>
          </div>
        </div>
        <Switch
          checked={isEnabled}
          onCheckedChange={(checked) =>
            onChange({
              ...config,
              data_gate_enabled: checked,
              collect_name: checked ? (config.collect_name ?? true) : config.collect_name,
              collect_email: checked ? (config.collect_email ?? true) : config.collect_email,
            })
          }
        />
      </div>

      {isEnabled && (
        <div className="space-y-2 pt-2 border-t border-border">
          <Label className="text-xs text-muted-foreground">Fields to collect:</Label>
          <div className="flex flex-col gap-2">
            {([
              { key: 'collect_name' as const, label: 'Name' },
              { key: 'collect_email' as const, label: 'Email' },
              { key: 'collect_phone' as const, label: 'Phone Number' },
            ]).map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <Checkbox
                  id={key}
                  checked={config[key] ?? false}
                  onCheckedChange={(checked) =>
                    onChange({ ...config, [key]: !!checked })
                  }
                />
                <Label htmlFor={key} className="text-sm cursor-pointer">
                  {label}
                </Label>
              </div>
            ))}
          </div>
          {!config.collect_name && !config.collect_email && !config.collect_phone && (
            <p className="text-xs text-destructive">Select at least one field</p>
          )}
        </div>
      )}
    </div>
  );
}
