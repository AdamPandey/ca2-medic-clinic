import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/config/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { formatForInput, formatForDisplay } from '@/lib/utils'; 
import { Trash2, Pencil, Plus, Search, Loader2, Eye } from 'lucide-react';
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
  first_name: z.string().min(2, "First name must be at least 2 characters."),
  last_name: z.string().min(2, "Last name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(10, "Phone number must be at least 10 digits."),
  address: z.string().min(5, "Address must be at least 5 characters."),
  date_of_birth: z.string().min(1, "Date of birth is required."),
});

export default function PatientsIndex() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Loading States
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false); // For delete action

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Delete States
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  // 2. Initialize Form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      address: "",
      date_of_birth: "",
    },
  });

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    setPageLoading(true);
    try {
      const res = await api.get('/patients');
      setPatients(res.data || []);
    } catch (e) { 
      console.error("Failed to fetch patients", e);
      toast.error("Failed to load patient data.");
      setPatients([]);
    } finally {
      setPageLoading(false);
    }
  };

  const getFullName = (p) => {
    if (p.name) return p.name;
    return `${p.first_name || ''} ${p.last_name || ''}`.trim();
  };

  const filteredPatients = patients.filter(p => 
    getFullName(p).toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3. Handle Submit (Validated)
  const onSubmit = async (values) => {
    try {
      if (isEditing) {
        await api.patch(`/patients/${currentId}`, values);
        toast.success("Patient updated successfully");
      } else {
        await api.post('/patients', values);
        toast.success("Patient registered successfully");
      }
      setIsFormOpen(false); 
      fetchPatients(); 
      form.reset();
    } catch (e) { 
      if (e.response?.data?.errors) {
         const msgs = Object.values(e.response.data.errors).flat().join(" ");
         toast.error(msgs);
      } else {
         toast.error(e.response?.data?.message || "Operation failed. Check your inputs."); 
      }
    }
  };

  // --- FIXED CASCADE DELETE LOGIC ---
  const executeCascadeDelete = async () => {
    if (!patientToDelete) return;
    setLoading(true);
    try {
      // 1. Fetch ALL dependencies (Appointments, Prescriptions, AND Diagnoses)
      const [apps, pres, diags] = await Promise.all([
        api.get('/appointments'), 
        api.get('/prescriptions'),
        api.get('/diagnoses') // <--- Include Diagnoses
      ]);
      
      // 2. Filter for this patient
      const relatedApps = apps.data.filter(a => a.patient_id === patientToDelete.id);
      const relatedPres = pres.data.filter(p => p.patient_id === patientToDelete.id);
      const relatedDiags = diags.data.filter(d => d.patient_id === patientToDelete.id); // <--- Filter Diagnoses

      // 3. Delete ALL dependencies
      await Promise.all([
        ...relatedApps.map(a => api.delete(`/appointments/${a.id}`)),
        ...relatedPres.map(p => api.delete(`/prescriptions/${p.id}`)),
        ...relatedDiags.map(d => api.delete(`/diagnoses/${d.id}`)) // <--- Delete Diagnoses
      ]);

      // 4. Finally, Delete Patient
      await api.delete(`/patients/${patientToDelete.id}`);
      
      setPatients(patients.filter(p => p.id !== patientToDelete.id));
      toast.success(`Patient and all history deleted.`);
    } catch (e) { 
        console.error(e);
        toast.error("Delete failed. Patient might still have records.");
    } finally {
        setLoading(false); setIsDeleteAlertOpen(false);
    }
  };

  const openAdd = () => {
      setIsEditing(false);
      setCurrentId(null);
      form.reset({ first_name: "", last_name: "", email: "", phone: "", address: "", date_of_birth: "" });
      setIsFormOpen(true);
  };

  const openEdit = (p) => {
    setIsEditing(true);
    setCurrentId(p.id);
    // 4. Populate form
    form.reset({
        first_name: p.first_name || p.name?.split(' ')[0] || "",
        last_name: p.last_name || p.name?.split(' ').slice(1).join(' ') || "",
        email: p.email,
        phone: p.phone,
        address: p.address,
        date_of_birth: formatForInput(p.date_of_birth) // Handles timestamp conversion
    });
    setIsFormOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Patients</h1>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4"/> Add Patient</Button>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditing?'Edit':'Add'} Patient</DialogTitle>
                        <DialogDescription>Enter patient details. All fields are required.</DialogDescription>
                    </DialogHeader>
                    
                    {/* 5. ShadCN Form */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="first_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl><Input placeholder="John" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="last_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl><Input placeholder="Doe" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl><Input placeholder="john@example.com" {...field} /></FormControl>
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
                                        <FormControl><Input placeholder="087..." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl><Input placeholder="123 Main St" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={form.control}
                                name="date_of_birth"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date of Birth</FormLabel>
                                        <FormControl><Input type="date" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                {isEditing ? "Save Changes" : "Create Patient"}
                            </Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>

        <div className="flex items-center space-x-2 bg-background p-2 rounded border max-w-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input 
                className="outline-none flex-1 text-sm bg-transparent"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Address</TableHead><TableHead>Phone</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                    {pageLoading ? (
                        <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="animate-spin mx-auto text-primary"/></TableCell></TableRow>
                    ) : filteredPatients.length > 0 ? (
                        filteredPatients.map((p, index) => (
                            <motion.tr 
                                key={p.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                className="hover:bg-muted/50 transition-colors"
                            >
                                <TableCell className="font-medium">{getFullName(p)}</TableCell>
                                <TableCell>{p.address}</TableCell>
                                <TableCell>{p.phone}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Link to={`/patients/${p.id}`}>
                                        <Button variant="ghost" size="icon" className="text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50">
                                            <Eye className="h-4 w-4"/>
                                        </Button>
                                    </Link>

                                    <Button variant="ghost" size="icon" className="hover:bg-muted" onClick={() => openEdit(p)}>
                                        <Pencil className="h-4 w-4"/>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50" onClick={() => { setPatientToDelete(p); setIsDeleteAlertOpen(true); }}>
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </TableCell>
                            </motion.tr>
                        ))
                    ) : (
                        <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No patients found.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </div>

        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Patient?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will delete <b>{getFullName(patientToDelete || {})}</b> and all their medical history (Appointments, Prescriptions, Diagnoses).
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={executeCascadeDelete} className="bg-red-600">
                        {loading ? <Loader2 className="animate-spin mr-2"/> : "Delete All Data"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}