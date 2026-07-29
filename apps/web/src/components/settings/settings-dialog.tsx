import { KeyIcon, PaintBrushIcon, ShieldIcon } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiKeysTab } from './api-keys-tab';
import { AppearanceTab } from './appearance-tab';
import { SecurityTab } from './security-tab';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-[60vw] sm:max-h-[70vh] sm:min-h-[70vh]">
        <Tabs
          orientation="vertical"
          defaultValue="appearance"
          className="flex-row"
        >
          <div className="flex w-44 shrink-0 flex-col gap-3 border-r p-4">
            <DialogTitle>Settings</DialogTitle>
            <TabsList className="h-fit w-full flex-col bg-transparent p-0">
              <TabsTrigger value="appearance">
                <PaintBrushIcon />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="security">
                <ShieldIcon />
                Security
              </TabsTrigger>
              <TabsTrigger value="api">
                <KeyIcon />
                API keys
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="max-h-[28rem] pt-10 min-h-72 flex-1 overflow-y-auto p-4">
            <TabsContent value="appearance">
              <AppearanceTab />
            </TabsContent>
            <TabsContent value="security">
              <SecurityTab />
            </TabsContent>
            <TabsContent value="api">
              <ApiKeysTab />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
