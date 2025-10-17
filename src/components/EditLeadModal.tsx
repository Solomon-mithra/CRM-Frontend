import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import type { Lead } from '../types/lead';
import { toast } from "sonner"; // Import toast

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdated: () => void;
  lead: Lead;
}

interface EditLeadFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  status: 'new' | 'contacted' | 'qualified' | 'negotiation' | 'closed' | 'lost';
  source: string;
  budget_min?: number | null;
  budget_max?: number | null;
  property_interest?: string | null;
}

const sourceOptions = ["website", "referral", "zillow", "other"];

const EditLeadModal: React.FC<EditLeadModalProps> = ({ isOpen, onClose, onLeadUpdated, lead }) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<EditLeadFormValues>({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      status: 'new', // Default status
      source: "website", // Default source
      budget_min: null,
      budget_max: null,
      property_interest: "",
    },
  });

  useEffect(() => {
    if (isOpen && lead) {
      form.reset({
        first_name: lead.first_name,
        last_name: lead.last_name,
        email: lead.email,
        phone: lead.phone,
        status: lead.status,
        source: lead.source,
        budget_min: lead.budget_min,
        budget_max: lead.budget_max,
        property_interest: lead.property_interest,
      });
    }
  }, [isOpen, lead, form]);

  async function onSubmit(values: EditLeadFormValues) {
    setLoading(true);
    try {
      await api.put(`/leads/${lead.id}`, values);
      onLeadUpdated();
      onClose();
      toast.success("Lead updated successfully!"); // Success toast
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update lead'); // Error toast
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
          <DialogDescription>
            Update the details for {lead.first_name} {lead.last_name}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 py-4 max-h-[70vh] overflow-y-auto px-2">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="first_name"
                rules={{ required: "First name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                rules={{ required: "Last name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+1-555-0100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              rules={{ required: "Status is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="negotiation">Negotiation</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="source"
              rules={{ required: "Source is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sourceOptions.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source.charAt(0).toUpperCase() + source.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="budget_min"
                rules={{
                  min: { value: 1, message: "Budget must be positive" },
                  validate: (value) => (value === null || value === undefined || !isNaN(value as number)) || "Invalid number",
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min. Budget</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="300000"
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
              <FormField
                control={form.control}
                name="budget_max"
                rules={{
                  min: { value: 1, message: "Budget must be positive" },
                  validate: (value) => (value === null || value === undefined || !isNaN(value as number)) || "Invalid number",
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max. Budget</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="450000"
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
            </div>
            <FormField
              control={form.control}
              name="property_interest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Interest</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., 3BR house in suburban area" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditLeadModal;