import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form'; // No FieldValues or ControllerRenderProps needed
// Removed: import { zodResolver } from '@hookform/resolvers/zod';
// Removed: import { z } from 'zod';
import api from '../services/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Form, // Re-added
  FormControl, // Re-added
  FormField, // Re-added
  FormItem, // Re-added
  FormLabel, // Re-added
  FormMessage, // Re-added
} from './ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';
import { toast } from "sonner"; // Import toast

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivityAdded: () => void;
  leadId: number;
}

interface ActivityFormValues {
  title: string;
  notes?: string;
  activity_date: string;
  activity_type: 'call' | 'email' | 'meeting' | 'note';
  duration?: number | null;
}

const AddActivityModal: React.FC<AddActivityModalProps> = ({ isOpen, onClose, onActivityAdded, leadId }) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<ActivityFormValues>({
    defaultValues: {
      title: "",
      notes: "",
      activity_date: new Date().toISOString().split('T')[0],
      activity_type: 'call',
      duration: null,
    },
  });

  const activityType = form.watch('activity_type');

  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: "",
        notes: "",
        activity_date: new Date().toISOString().split('T')[0],
        activity_type: 'call',
        duration: null,
      });
    }
  }, [isOpen, form]);

  async function onSubmit(values: ActivityFormValues) {
    setLoading(true);
    try {
      await api.post(`/leads/${leadId}/activities`, values);
      onActivityAdded();
      onClose();
      toast.success("Activity added successfully!"); // Success toast
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to add activity'); // Error toast
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Activity</DialogTitle>
          <DialogDescription>Log a new interaction for this lead.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="activity_type"
              rules={{ required: "Activity type is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an activity type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              rules={{ required: "Title is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Initial consultation call" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="activity_date"
              rules={{ required: "Date is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {activityType === 'call' && (
              <FormField
                control={form.control}
                name="duration"
                rules={{
                  min: { value: 1, message: "Duration must be positive" },
                  validate: (value) => (value === null || value === undefined || !isNaN(value as number)) || "Invalid number",
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="30"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? null : Number(value));
                        }}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Discussed budget and preferences." {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Activity'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddActivityModal;