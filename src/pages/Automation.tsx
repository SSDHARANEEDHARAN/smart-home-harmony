import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { AutomationRuleCard } from '@/components/automation/AutomationRuleCard';
import { CreateAutomationDialog } from '@/components/automation/CreateAutomationDialog';
import { useAuth } from '@/hooks/useAuth';
import { useDevices } from '@/hooks/useDevices';
import { useAutomationRules } from '@/hooks/useAutomationRules';
import { useSettings } from '@/hooks/useSettings';
import { Loader2, Settings, Clock, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Automation() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { devices, isLoading: devicesLoading } = useDevices();
  const { rules, isLoading: rulesLoading, toggleRule, deleteRule } = useAutomationRules();
  const { settings } = useSettings();
  
  const automationEnabled = settings.notifications.automationTriggers;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || devicesLoading || rulesLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const handleToggleRule = (ruleId: string, isEnabled: boolean) => {
    toggleRule.mutate({ id: ruleId, is_enabled: isEnabled });
  };

  const handleDeleteRule = () => {
    if (ruleToDelete) {
      deleteRule.mutate(ruleToDelete);
      setDeleteDialogOpen(false);
      setRuleToDelete(null);
    }
  };

  const activeRules = rules.filter((r) => r.is_enabled).length;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Automation</h1>
              <p className="text-muted-foreground">
                {activeRules} active rule{activeRules !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          {automationEnabled && <CreateAutomationDialog devices={devices} />}
        </div>

        {/* Warning when automation is disabled */}
        {!automationEnabled && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Automation Disabled</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>Enable "Automation Triggers" in Settings to create and manage automation rules.</span>
              <Link to="/settings">
                <Button variant="outline" size="sm">
                  Go to Settings
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Rules List */}
        {rules.length === 0 ? (
          <div className="text-center py-12 glass rounded-xl border border-border/50">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No automation rules yet</h3>
            <p className="text-muted-foreground mb-4">
              {automationEnabled 
                ? 'Create rules to automate your devices on a schedule'
                : 'Enable automation triggers in Settings to create rules'}
            </p>
            {automationEnabled && <CreateAutomationDialog devices={devices} />}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {rules.map((rule) => (
              <AutomationRuleCard
                key={rule.id}
                rule={rule}
                onToggle={(isEnabled) => handleToggleRule(rule.id, isEnabled)}
                onDelete={() => {
                  setRuleToDelete(rule.id);
                  setDeleteDialogOpen(true);
                }}
              />
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="glass border-border/50">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Automation Rule</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this rule? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteRule}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
