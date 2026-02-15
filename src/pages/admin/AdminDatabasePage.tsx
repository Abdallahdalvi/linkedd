import { Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { SchemaExportSection } from '@/components/settings/SchemaExportSection';

export default function AdminDatabasePage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Database className="w-8 h-8 text-primary" />
            Database Schema
          </h1>
          <p className="text-muted-foreground mt-1">Copy SQL queries to recreate tables in your own database</p>
        </div>
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Super Admin Only
        </Badge>
      </div>

      <SchemaExportSection />
    </div>
  );
}
