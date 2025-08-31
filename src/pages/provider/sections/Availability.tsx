import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Provider, AvailabilitySettings } from '@/types/provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Clock, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface AvailabilitySettingsProps {
  provider: Provider;
}

export default function AvailabilitySettings({ provider }: AvailabilitySettingsProps) {
  const [availabilitySettings, setAvailabilitySettings] = useState<AvailabilitySettings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<AvailabilitySettings | null>(null);
  const { toast } = useToast();

  const defaultWeekdays: AvailabilitySettings['weekday'][] = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  const [formData, setFormData] = useState({
    weekday: defaultWeekdays[0],
    start_time: '09:00',
    end_time: '17:00',
    is_available: true
  });

  const fetchAvailabilitySettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('availability_settings')
        .select('*')
        .eq('provider_id', provider.id)
        .order('weekday');

      if (error) throw error;

      setAvailabilitySettings(data as AvailabilitySettings[]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error fetching availability settings';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [provider.id, toast]);

  useEffect(() => {
    fetchAvailabilitySettings();
  }, [fetchAvailabilitySettings]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Validate times
      const startTime = new Date(`2000-01-01T${formData.start_time}`);
      const endTime = new Date(`2000-01-01T${formData.end_time}`);
      
      if (endTime <= startTime) {
        throw new Error('End time must be after start time');
      }

      // Check for existing setting for this weekday
      const existingSetting = availabilitySettings.find(
        setting => setting.weekday === formData.weekday
      );

      const settingData = {
        provider_id: provider.id,
        weekday: formData.weekday,
        start_time: formData.start_time,
        end_time: formData.end_time,
        is_available: formData.is_available,
        ...(existingSetting && { id: existingSetting.id })
      };

      const { error } = await supabase
        .from('availability_settings')
        .upsert([settingData]);

      if (error) throw error;

      fetchAvailabilitySettings();
      setFormData({ ...formData, weekday: defaultWeekdays[0] });

      toast({
        title: 'Availability settings saved',
        description: `Schedule for ${formData.weekday} has been updated.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error saving availability settings';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('availability_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAvailabilitySettings(settings => settings.filter(s => s.id !== id));
      toast({
        title: 'Setting deleted',
        description: 'The availability setting has been removed.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error deleting setting';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Availability Settings</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Clock className="mr-2 h-4 w-4" />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Availability</DialogTitle>
              <DialogDescription>
                Set your working hours for each day of the week.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="weekday">Day of Week</Label>
                <select
                  id="weekday"
                  className="w-full p-2 border rounded"
                  value={formData.weekday}
                  onChange={(e) => setFormData({
                    ...formData,
                    weekday: e.target.value as AvailabilitySettings['weekday']
                  })}
                >
                  {defaultWeekdays.map(day => (
                    <option key={day} value={day}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                />
                <Label htmlFor="is_available">Available for bookings</Label>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {availabilitySettings.map((setting) => (
          <Card key={setting.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>
                    {setting.weekday.charAt(0).toUpperCase() + setting.weekday.slice(1)}
                  </CardTitle>
                  <CardDescription>
                    {formatTime(setting.start_time)} - {formatTime(setting.end_time)}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={setting.is_available}
                    onCheckedChange={async (checked) => {
                      const { error } = await supabase
                        .from('availability_settings')
                        .update({ is_available: checked })
                        .eq('id', setting.id);

                      if (error) {
                        toast({
                          title: 'Error',
                          description: 'Failed to update availability',
                          variant: 'destructive',
                        });
                      } else {
                        setAvailabilitySettings(settings =>
                          settings.map(s =>
                            s.id === setting.id ? { ...s, is_available: checked } : s
                          )
                        );
                      }
                    }}
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this schedule? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(setting.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!setting.is_available && (
                <p className="text-sm text-gray-500">Currently unavailable for bookings</p>
              )}
            </CardContent>
          </Card>
        ))}

        {availabilitySettings.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-gray-500">
                <Clock className="mx-auto h-12 w-12 opacity-50" />
                <p className="mt-2">No availability settings configured</p>
                <p className="text-sm">Click "Add Schedule" to set your working hours</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
