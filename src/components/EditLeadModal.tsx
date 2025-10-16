import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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

// This should ideally be in a shared types file
interface Lead {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  budget_min: number | null;
  budget_max: number | null;
  property_interest: string | null;
}

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdated: () => void;
  lead: Lead;
}

const leadEditSchema = z.object({
  first_name: z.string().min(1, { message: "First name is required" }),
  last_name: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'negotiation', 'closed', 'lost']),
  source: z.string().min(1, { message: "Source is required" }),
  budget_min: z.coerce.number().positive().optional().nullable(),
  budget_max: z.coerce.number().positive().optional().nullable(),
  property_interest: z.string().optional().nullable(),
});

const EditLeadModal: React.FC<EditLeadModalProps> = ({ isOpen, onClose, onLeadUpdated, lead }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof leadEditSchema>>({
    resolver: zodResolver(leadEditSchema),
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
    } else {
      setError(null);
    }
  }, [isOpen, lead, form]);

  async function onSubmit(values: z.infer<typeof leadEditSchema>) {
    setLoading(true);
    setError(null);
    try {
      await api.put(`/leads/${lead.id}`, values);
      onLeadUpdated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update lead');
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
              <FormField control={form.control} name="first_name" render={({ field }) => (
                <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="last_name" render={({ field }) => (
                <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
            </div>
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent></Select><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="source" render={({ field }) => (
              <FormItem><FormLabel>Source</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="budget_min" render={({ field }) => (
                <FormItem><FormLabel>Min. Budget</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="budget_max" render={({ field }) => (
                <FormItem><FormLabel>Max. Budget</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
              )}/>
            </div>
            <FormField control={form.control} name="property_interest" render={({ field }) => (
              <FormItem><FormLabel>Property Interest</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )}/>
            
            {error && <p className="text-red-500 text-sm text-center pt-2">{error}</p>}

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
