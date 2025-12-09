import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/config/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Trash2, Pencil, Plus, Calendar as CalendarIcon, Loader2, User, Stethoscope, Eye } from 'lucide-react';
import { formatForDisplay } from '@/lib/utils'; 
import { motion, useAnimation } from 'framer-motion';

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
  doctor_id: z.string().min(1, "Please select a doctor."),
  patient_id: z.string().min(1, "Please select a patient."),
  date: z.string().min(1, "Please select a date."),
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function AppointmentsIndex() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  
  // Loading States
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Delete States
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  const controls = useAnimation();

  // 2. Initialize Form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      doctor_id: "",
      patient_id: "",
      date: "",
    },
  });

  useEffect(() => {
    if (!pageLoading && appointments.length > 0) {
      controls.start("visible");
    }
  }, [pageLoading, appointments, controls]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setPageLoading(true);
    try {
      const [appRes, docRes, patRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/doctors'),
        api.get('/patients')
      ]);
      setAppointments(appRes.data || []);
      setDoctors(docRes.data || []);
      setPatients(patRes.data || []);
    } catch (e) {
      console.error("Failed to load data", e);
      toast.error("Failed to load appointment data");
      setAppointments([]);
    } finally {
      setPageLoading(false);
    }
  };

  const getDocName = (id) => {
    const doc = doctors.find(d => d.id === id);
    if (!doc) return 'Unknown Doctor';
    return doc.name || `${doc.first_name} ${doc.last_name}`;
  };

  const getPatName = (id) => {
    const pat = patients.find(p => p.id === id);
    if (!pat) return 'Unknown Patient';
    return pat.name || `${pat.first_name} ${pat.last_name}`;
  };

  // 3. Handle Submit (Validated)
  const onSubmit = async (values) => {
    // Convert string IDs back to numbers for API
    const payload = {
        appointment_date: values.date,
        doctor_id: parseInt(values.doctor_id),
        patient_id: parseInt(values.patient_id)
    };

    try {
      if (isEditing) {
        await api.patch(`/appointments/${currentId}`, payload);
        toast.success("Appointment rescheduled");
      } else {
        await api.post('/appointments', payload);
        toast.success("Appointment booked successfully");
      }
      setIsFormOpen(false); 
      fetchData(); 
      form.reset();
    } catch (e) { 
      console.error(e);
      toast.error(e.response?.data?.message || "Operation failed"); 
    }
  };

  const handleDelete = async () => {
    if (!appointmentToDelete) return;
    setActionLoading(true);
    try {
        await api.delete(`/appointments/${appointmentToDelete.id}`);
        setAppointments(appointments.filter(a => a.id !== appointmentToDelete.id));
        toast.success("Appointment cancelled");
    } catch (e) {
        toast.error("Could not cancel appointment");
    } finally {
        setActionLoading(false);
        setIsDeleteAlertOpen(false);
    }
  };

  const openAdd = () => {
      setIsEditing(false);
      setCurrentId(null);
      form.reset({ doctor_id: "", patient_id: "", date: "" });
      setIsFormOpen(true);
  };

  const openEdit = (app) => {
    setIsEditing(true);
    setCurrentId(app.id);
    
    // Handle Date conversion (Timestamp -> String)
    let dateStr = '';
    if (app.appointment_date) {
        const dateObj = new Date(app.appointment_date * 1000);
        if (!isNaN(dateObj.getTime())) {
            dateStr = dateObj.toISOString().split('T')[0];
        }
    }

    form.reset({
        doctor_id: app.doctor_id.toString(),
        patient_id: app.patient_id.toString(),
        date: dateStr
    });
    setIsFormOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Appointments</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4"/> Book Appointment</Button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Reschedule' : 'Book New'} Appointment</DialogTitle>
                    <DialogDescription>Select a doctor and patient to schedule a consultation.</DialogDescription>
                </DialogHeader>
                
                {/* 4. ShadCN Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        
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
                                                <SelectItem key={d.id} value={d.id.toString()}>
                                                    {d.name || `${d.first_name} ${d.last_name}`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                                                <SelectItem key={p.id} value={p.id.toString()}>
                                                    {p.name || `${p.first_name} ${p.last_name}`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="date"
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

                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                            {isEditing ? 'Update Appointment' : 'Confirm Booking'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
      </div>

      {/* Note: Appointments generally don't have a search bar as simple as string matching unless filtering by date/name manually. Keeping it simple here or removing search is fine. I've removed it for cleaner UI, or you can add filtering logic later. */}
      
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <motion.tbody variants={containerVariants} initial="hidden" animate={controls}>
            {pageLoading ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="animate-spin mx-auto text-primary"/></TableCell></TableRow>
            ) : appointments.length > 0 ? (
                appointments.map((app, index) => (
                <motion.tr 
                    key={app.id}
                    variants={itemVariants}
                    className="hover:bg-muted/50 transition-colors"
                >
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground"/>
                            {formatForDisplay(app.appointment_date)}
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4 text-blue-500"/>
                            {getDocName(app.doctor_id)}
                        </div>
                    </TableCell>
                    <TableCell>
                        <Link to={`/patients/${app.patient_id}`} className="hover:underline">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-green-500"/>
                                {getPatName(app.patient_id)}
                            </div>
                        </Link>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                    <Link to={`/appointments/${app.id}`}>
                        <Button variant="ghost" size="icon" className="text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50">
                            <Eye className="h-4 w-4"/>
                        </Button>
                    </Link>

                    <Button variant="ghost" size="icon" className="hover:bg-muted" onClick={() => openEdit(app)}><Pencil className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50" onClick={() => { setAppointmentToDelete(app); setIsDeleteAlertOpen(true); }}><Trash2 className="h-4 w-4"/></Button>
                    </TableCell>
                </motion.tr>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                        No appointments found.
                    </TableCell>
                </TableRow>
            )}
          </motion.tbody>
        </Table>
      </div>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The slot will be freed up immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">{actionLoading ? <Loader2 className="animate-spin"/> : "Yes, Cancel it"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}