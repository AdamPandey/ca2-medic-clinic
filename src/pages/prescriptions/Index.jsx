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
import { Trash2, Pencil, Plus, Pill, Search, Loader2, Eye } from 'lucide-react';
import { formatForDisplay } from '@/lib/utils'; 
import { motion } from 'framer-motion';

// --- VALIDATION IMPORTS ---
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

// 1. Define Validation Schema
const formSchema = z.object({
  medication: z.string().min(2, "Medication name is required."),
  dosage: z.string().min(1, "Dosage instructions are required."),
  start_date: z.string().min(1, "Start date is required."),
  end_date: z.string().min(1, "End date is required."),
  doctor_id: z.string().min(1, "Prescribing doctor is required."),
  patient_id: z.string().min(1, "Patient is required."),
  diagnosis_id: z.string().min(1, "A linked diagnosis is required."),
});

export default function PrescriptionsIndex() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  
  // Loading States
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal & Edit States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Delete States
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // 2. Initialize Form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      medication: "",
      dosage: "",
      start_date: "",
      end_date: "",
      doctor_id: "",
      patient_id: "",
      diagnosis_id: "",
    },
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setPageLoading(true);
    try {
      const [presRes, docRes, patRes, diagRes] = await Promise.all([
        api.get('/prescriptions'),
        api.get('/doctors'),
        api.get('/patients'),
        api.get('/diagnoses')
      ]);
      setPrescriptions(presRes.data || []);
      setDoctors(docRes.data || []);
      setPatients(patRes.data || []);
      setDiagnoses(diagRes.data || []);
    } catch (e) {
      console.error("Failed to load data", e);
      toast.error("Failed to load prescription data");
      setPrescriptions([]);
    } finally {
      setPageLoading(false);
    }
  };

  // --- HELPERS ---
  const getDocName = (id) => {
    const d = doctors.find(x => x.id === id);
    return d ? (d.name || `${d.first_name} ${d.last_name}`) : 'Unknown';
  };
  const getPatName = (id) => {
    const p = patients.find(x => x.id === id);
    return p ? (p.name || `${p.first_name} ${p.last_name}`) : 'Unknown';
  };

  const filteredPrescriptions = prescriptions.filter(p => 
    p.medication.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getPatName(p.patient_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3. Handle Submit (Validated)
  const onSubmit = async (values) => {
    // API requires IDs as numbers
    const payload = {
        ...values,
        doctor_id: parseInt(values.doctor_id),
        patient_id: parseInt(values.patient_id),
        diagnosis_id: parseInt(values.diagnosis_id)
    };

    try {
      if (isEditing) {
        await api.patch(`/prescriptions/${currentId}`, payload);
        toast.success("Prescription updated");
      } else {
        await api.post('/prescriptions', payload);
        toast.success("Prescription issued successfully");
      }
      setIsFormOpen(false); 
      fetchData(); 
      form.reset();
    } catch (e) { 
      console.error(e);
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
        await api.delete(`/prescriptions/${itemToDelete.id}`);
        setPrescriptions(prescriptions.filter(p => p.id !== itemToDelete.id));
        toast.success("Prescription revoked");
    } catch (e) {
        toast.error("Could not delete prescription");
    } finally {
        setActionLoading(false);
        setIsDeleteAlertOpen(false);
    }
  };

  const openAdd = () => {
      setIsEditing(false);
      setCurrentId(null);
      form.reset({ 
          medication: "", dosage: "", start_date: "", end_date: "", 
          doctor_id: "", patient_id: "", diagnosis_id: "" 
      });
      setIsFormOpen(true);
  };

  const openEdit = (item) => {
    setIsEditing(true);
    setCurrentId(item.id);
    
    form.reset({
        medication: item.medication,
        dosage: item.dosage,
        start_date: item.start_date,
        end_date: item.end_date,
        doctor_id: item.doctor_id.toString(),
        patient_id: item.patient_id.toString(),
        diagnosis_id: item.diagnosis_id.toString()
    });
    setIsFormOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Prescriptions</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4"/> Issue Prescription</Button>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Prescription' : 'Issue New Prescription'}</DialogTitle>
                    <DialogDescription>Link a medication to a diagnosis, doctor, and patient.</DialogDescription>
                </DialogHeader>
                
                {/* 4. ShadCN Form Wrapper */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="patient_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Patient</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Select Patient" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {patients.map(p => (
                                                    <SelectItem key={p.id} value={p.id.toString()}>{getPatName(p.id)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="doctor_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Doctor</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Select Doctor" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {doctors.map(d => (
                                                    <SelectItem key={d.id} value={d.id.toString()}>{getDocName(d.id)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="diagnosis_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Diagnosis</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select Diagnosis" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {diagnoses.length === 0 ? (
                                                <SelectItem value="disabled" disabled>No Diagnoses Found</SelectItem>
                                            ) : (
                                                diagnoses.map(d => (
                                                    <SelectItem key={d.id} value={d.id.toString()}>
                                                        {d.condition || `Diagnosis #${d.id}`}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="medication"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Medication</FormLabel>
                                        <FormControl><Input placeholder="Amoxicillin" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dosage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dosage</FormLabel>
                                        <FormControl><Input placeholder="500mg daily" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="start_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Date</FormLabel>
                                        <FormControl><Input type="date" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="end_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Date</FormLabel>
                                        <FormControl><Input type="date" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                            {isEditing ? 'Update Prescription' : 'Issue Prescription'}
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
            placeholder="Search medications..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
        />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medication</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Prescribed By</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageLoading ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader2 className="animate-spin mx-auto text-primary"/></TableCell></TableRow>
            ) : filteredPrescriptions.length > 0 ? (
                filteredPrescriptions.map((item, index) => (
                <motion.tr 
                    key={item.id}
                    layout 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }} 
                    className="hover:bg-muted/50 transition-colors"
                >
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                            <Pill className="h-4 w-4 text-purple-500"/>
                            <div>
                                <p>{item.medication}</p>
                                <p className="text-xs text-muted-foreground">{item.dosage}</p>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>
                        <Link to={`/patients/${item.patient_id}`} className="hover:underline text-blue-600">
                            {getPatName(item.patient_id)}
                        </Link>
                    </TableCell>
                    <TableCell>{getDocName(item.doctor_id)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                        {formatForDisplay(item.start_date)} - {formatForDisplay(item.end_date)}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                        {/* EYE BUTTON */}
                        <Link to={`/prescriptions/${item.id}`}>
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
                <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No records found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Prescription?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
                {actionLoading ? <Loader2 className="animate-spin"/> : "Revoke"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}