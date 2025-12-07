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
import { Trash2, Pencil, Plus, Search, Loader2, Eye } from 'lucide-react';
import { motion } from 'framer-motion'; // Removed AnimatePresence for snappy search

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
  specialisation: z.string().min(1, "Please select a specialisation."),
});

const specialisations = ["General Practitioner", "Podiatrist", "Dermatologist", "Pediatrician", "Psychiatrist"];

export default function DoctorsIndex() {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // States
  const [pageLoading, setPageLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  // Delete States
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);

  // 2. Initialize Form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      specialisation: "",
    },
  });

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    setPageLoading(true);
    try {
      const res = await api.get('/doctors');
      setDoctors(res.data || []);
    } catch (e) { 
      console.error("Failed to fetch doctors:", e);
      toast.error("Could not load doctor data.");
      setDoctors([]);
    } finally {
      setPageLoading(false);
    }
  };

  const getFullName = (d) => {
    if (!d) return '';
    return `${d.first_name || ''} ${d.last_name || ''}`.trim();
  };

  const filteredDoctors = doctors.filter(d => {
    const fullName = getFullName(d).toLowerCase();
    const specialisation = d.specialisation ? d.specialisation.toLowerCase() : '';
    const term = searchTerm.toLowerCase();
    return fullName.includes(term) || specialisation.includes(term);
  });

  // 3. Handle Submit (Called by RHF only if validation passes)
  const onSubmit = async (values) => {
    try {
      if (isEditing) {
        await api.patch(`/doctors/${currentId}`, values);
        toast.success("Doctor updated successfully");
      } else {
        await api.post('/doctors', values);
        toast.success("Doctor created successfully");
      }
      setIsFormOpen(false); 
      fetchDoctors(); 
      form.reset();
    } catch (e) { 
      if (e.response?.data?.errors) {
         const msgs = Object.values(e.response.data.errors).flat().join(" ");
         toast.error(msgs);
      } else {
         toast.error(e.response?.data?.message || "Operation failed."); 
      }
    }
  };

  const executeCascadeDelete = async () => {
    if (!doctorToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/doctors/${doctorToDelete.id}`);
      setDoctors(doctors.filter(d => d.id !== doctorToDelete.id));
      toast.success(`Doctor record deleted.`);
    } catch (e) {
        if (e.response?.status === 409) {
            toast.error("Cannot delete: Doctor has existing appointments.");
        } else {
            toast.error("Delete failed.");
        }
    } finally {
        setDeleteLoading(false); setIsDeleteAlertOpen(false);
    }
  };

  const openAdd = () => {
      setIsEditing(false);
      setCurrentId(null);
      form.reset({ first_name: "", last_name: "", email: "", phone: "", specialisation: "" });
      setIsFormOpen(true);
  };

  const openEdit = (d) => {
    setIsEditing(true);
    setCurrentId(d.id);
    // 4. Populate form for editing
    form.reset({
        first_name: d.first_name || d.name?.split(' ')[0] || "",
        last_name: d.last_name || d.name?.split(' ').slice(1).join(' ') || "",
        email: d.email,
        phone: d.phone,
        specialisation: d.specialisation
    });
    setIsFormOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Doctors</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4"/> Add Doctor</Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Doctor' : 'Add New Doctor'}</DialogTitle>
              <DialogDescription>Enter the doctor's details below.</DialogDescription>
            </DialogHeader>
            
            {/* 5. The ShadCN Form Wrapper */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="first_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl><Input placeholder="Jane" {...field} /></FormControl>
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
                        name="specialisation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Specialisation</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select Specialisation" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {specialisations.map(spec => (<SelectItem key={spec} value={spec}>{spec}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl><Input placeholder="doctor@clinic.com" {...field} /></FormControl>
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

                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                        {isEditing ? 'Save Changes' : 'Create Doctor'}
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
            placeholder="Search doctors..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
        />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Specialisation</TableHead><TableHead>Email</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {pageLoading ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="animate-spin mx-auto text-primary"/></TableCell></TableRow>
            ) : filteredDoctors.length > 0 ? (
                // --- SNAPPY ANIMATION FIX ---
                // 1. layout: Smoothly slides items up/down when one is removed/hidden
                // 2. No AnimatePresence: Items disappear instantly on search
                // 3. Simple transition: nice fade in on load
                filteredDoctors.map((doc, index) => (
                <motion.tr 
                    key={doc.id}
                    layout 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }} 
                    className="hover:bg-muted/50 transition-colors"
                >
                    <TableCell className="font-medium">{getFullName(doc)}</TableCell>
                    <TableCell>{doc.specialisation || 'N/A'}</TableCell>
                    <TableCell>{doc.email}</TableCell>
                    <TableCell className="text-right space-x-2">
                    <Link to={`/doctors/${doc.id}`}>
                        <Button variant="ghost" size="icon" className="text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50"><Eye className="h-4 w-4"/></Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="hover:bg-muted" onClick={() => openEdit(doc)}><Pencil className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50" onClick={() => { setDoctorToDelete(doc); setIsDeleteAlertOpen(true); }}><Trash2 className="h-4 w-4"/></Button>
                    </TableCell>
                </motion.tr>
                ))
            ) : (
                <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No doctors found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Doctor?</AlertDialogTitle><AlertDialogDescription>This action may fail if the doctor has existing appointments.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeCascadeDelete} className="bg-red-600">{deleteLoading ? <Loader2 className="animate-spin"/> : "Confirm Delete"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}