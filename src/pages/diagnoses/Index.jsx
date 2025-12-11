import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/config/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Trash2, Pencil, Plus, Search, Loader2, FileText, User, Eye } from 'lucide-react';
import { formatForDisplay, formatForInput } from '@/lib/utils'; 
import { motion } from 'framer-motion'; // Removed AnimatePresence

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  patient_id: z.string().min(1, "Please select a patient."),
  condition: z.string().min(3, "Condition must be at least 3 characters."),
  diagnosis_date: z.string().min(1, "Date of diagnosis is required."),
});

export default function DiagnosesIndex() {
  const [diagnoses, setDiagnoses] = useState([]);
  const [patients, setPatients] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patient_id: "",
      condition: "",
      diagnosis_date: "",
    },
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setPageLoading(true);
    try {
      const [diagRes, patRes] = await Promise.all([
        api.get('/diagnoses'),
        api.get('/patients')
      ]);
      setDiagnoses(diagRes.data || []);
      setPatients(patRes.data || []);
    } catch (e) {
      console.error("Failed to load data", e);
      toast.error("Failed to load diagnoses data");
      setDiagnoses([]);
    } finally {
      setPageLoading(false);
    }
  };

  const getPatName = (id) => {
    const p = patients.find(x => x.id === id);
    return p ? (p.name || `${p.first_name} ${p.last_name}`) : 'Unknown Patient';
  };

  const filteredDiagnoses = diagnoses.filter(d => 
    d.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getPatName(d.patient_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (values) => {
    const payload = {
        condition: values.condition,
        diagnosis_date: values.diagnosis_date,
        patient_id: parseInt(values.patient_id)
    };

    try {
      if (isEditing) {
        await api.patch(`/diagnoses/${currentId}`, payload);
        toast.success("Diagnosis record updated");
      } else {
        await api.post('/diagnoses', payload);
        toast.success("Diagnosis recorded successfully");
      }
      setIsFormOpen(false); 
      fetchData(); 
      form.reset();
    } catch (e) { 
      if (e.response?.data?.errors) {
         const msgs = Object.values(e.response.data.errors).flat().join(" ");
         toast.error(msgs);
      } else {
         toast.error(e.response?.data?.message || "Operation failed"); 
      }
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setActionLoading(true);
    try {
        await api.delete(`/diagnoses/${itemToDelete.id}`);
        setDiagnoses(diagnoses.filter(d => d.id !== itemToDelete.id));
        toast.success("Diagnosis record deleted");
    } catch (e) {
        if (e.response?.status === 409) {
            toast.error("Cannot delete: This diagnosis is linked to active prescriptions.");
        } else {
            toast.error("Could not delete record");
        }
    } finally {
        setActionLoading(false);
        setIsDeleteAlertOpen(false);
    }
  };

  const openAdd = () => {
      setIsEditing(false);
      setCurrentId(null);
      form.reset({ condition: "", diagnosis_date: "", patient_id: "" });
      setIsFormOpen(true);
  };

  const openEdit = (item) => {
    setIsEditing(true);
    setCurrentId(item.id);
    
    form.reset({
        condition: item.condition,
        diagnosis_date: formatForInput(item.diagnosis_date),
        patient_id: item.patient_id.toString()
    });
    setIsFormOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Diagnoses</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4"/> Add Diagnosis</Button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Diagnosis' : 'New Diagnosis'}</DialogTitle>
                    <DialogDescription>Record a new medical condition for a patient.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="patient_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Patient</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select Patient" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {patients.map(p => (<SelectItem key={p.id} value={p.id.toString()}>{getPatName(p.id)}</SelectItem>))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="condition"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Condition</FormLabel>
                                    <FormControl><Input placeholder="e.g. Type 2 Diabetes" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="diagnosis_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date of Diagnosis</FormLabel>
                                    <FormControl><Input type="date" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                            {isEditing ? 'Update Record' : 'Record Diagnosis'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2 bg-background p-2 rounded border max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input 
            className="border-0 focus-visible:ring-0 bg-transparent" 
            placeholder="Search conditions..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
        />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Condition</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Date Recorded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageLoading ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="animate-spin mx-auto text-primary"/></TableCell></TableRow>
            ) : filteredDiagnoses.length > 0 ? (
                // removed AnimatePresence
                filteredDiagnoses.map((item, index) => (
                <motion.tr 
                    key={item.id}
                    layout // This Magic Prop handles the smooth sliding up/down!
                    
                    // Initial load animation (Staggered)
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    
                    // NO EXIT ANIMATION -> Instant removal for snappy feel
                    
                    transition={{ 
                        duration: 0.3, 
                        delay: index * 0.05 // Slight stagger for load, fast enough for search
                    }}
                    className="hover:bg-muted/50 transition-colors"
                >
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-orange-500"/>
                            {item.condition}
                        </div>
                    </TableCell>
                    <TableCell>
                        <Link to={`/patients/${item.patient_id}`} className="hover:underline">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground"/>
                                {getPatName(item.patient_id)}
                            </div>
                        </Link>
                    </TableCell>
                    <TableCell>{formatForDisplay(item.diagnosis_date)}</TableCell>
                    <TableCell className="text-right space-x-2">
                        <Link to={`/diagnoses/${item.id}`}>
                            <Button variant="ghost" size="icon" className="text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50">
                                <Eye className="h-4 w-4"/>
                            </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="hover:bg-muted" onClick={() => openEdit(item)}>
                            <Pencil className="h-4 w-4"/>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50" onClick={() => { setItemToDelete(item); setIsDeleteAlertOpen(true); }}>
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                    </TableCell>
                </motion.tr>
                ))
            ) : (
                <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No records found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. 
              Note: You cannot delete a diagnosis if active prescriptions depend on it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
                {actionLoading ? <Loader2 className="animate-spin"/> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}