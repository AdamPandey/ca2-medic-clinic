import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import api from "@/config/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, Pill, LogOut, Loader2, Plus, FileText, User, MapPin, Phone, ShieldAlert } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { toast } from "sonner";
import { formatForDisplay } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; 

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const location = useLocation(); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [patientProfile, setPatientProfile] = useState(null);
  const [myAppointments, setMyAppointments] = useState([]);
  const [myPrescriptions, setMyPrescriptions] = useState([]);
  const [myDiagnoses, setMyDiagnoses] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState({ doctor_id: '', date: '' });

  // Animation State
  const [isShaking, setIsShaking] = useState(false);

  // 1. Check for Access Denied Redirect
  useEffect(() => {
    if (location.state?.accessDenied) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500); 

        toast.error("Access Denied", {
            description: "You do not have permission to view that page.",
            icon: <ShieldAlert className="h-5 w-5 text-red-600" />,
            duration: 4000,
        });

        // Clear state to prevent loop
        window.history.replaceState({}, document.title);
    }
  }, [location]);

  // 2. Fetch Data
  useEffect(() => {
    const initDashboard = async () => {
        try {
            const patRes = await api.get('/patients');
            const foundPatient = patRes.data.find(p => p.email.toLowerCase() === user.email.toLowerCase());

            if (foundPatient) {
                setPatientProfile(foundPatient);
                const [appRes, presRes, diagRes] = await Promise.all([
                    api.get('/appointments'),
                    api.get('/prescriptions'),
                    api.get('/diagnoses')
                ]);
                setMyAppointments(appRes.data.filter(a => a.patient_id === foundPatient.id));
                setMyPrescriptions(presRes.data.filter(p => p.patient_id === foundPatient.id));
                setMyDiagnoses(diagRes.data.filter(d => d.patient_id === foundPatient.id));
            }
            const docRes = await api.get('/doctors');
            setDoctors(docRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    initDashboard();
  }, [user.email]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!patientProfile) return toast.error("Account not linked.");

    try {
        await api.post('/appointments', {
            appointment_date: bookingData.date,
            doctor_id: parseInt(bookingData.doctor_id),
            patient_id: patientProfile.id
        });
        
        toast.success("Appointment Request Sent!");
        setIsModalOpen(false);
        setBookingData({ doctor_id: '', date: '' });
        
        const appRes = await api.get('/appointments');
        setMyAppointments(appRes.data.filter(a => a.patient_id === patientProfile.id));

    } catch (e) {
        toast.error("Booking failed.");
    }
  };

  const getDocName = (id) => {
      const d = doctors.find(doc => doc.id === id);
      return d ? `Dr. ${d.last_name}` : 'Unknown Doctor';
  };

  // --- CHANGED RENDER STRUCTURE ---
  // The motion.div now wraps everything. The Loader is INSIDE the main block.
  return (
    <motion.div 
        className="min-h-screen bg-muted/40 flex flex-col transition-colors"
        animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ type: "spring", stiffness: 300, damping: 10 }}
    >
        {/* Header (Always Visible) */}
        <header className="flex h-16 items-center justify-between border-b px-6 bg-background/95 backdrop-blur sticky top-0 z-10">
            <div className="flex items-center gap-2 font-bold text-primary text-xl">
                <span>MedClinic</span>
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100 px-2 py-0.5 rounded-full">Patient Portal</span>
            </div>
            <div className="flex items-center gap-4">
                <ModeToggle />
                <span className="text-sm text-muted-foreground hidden md:inline">
                    {user.email}
                </span>
                <Button variant="destructive" size="sm" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                </Button>
            </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full space-y-8">
            
            {/* CONDITIONAL LOADING: Only hides the content, not the container */}
            {loading ? (
                <div className="h-[60vh] flex items-center justify-center">
                    <Loader2 className="animate-spin h-10 w-10 text-primary"/>
                </div>
            ) : (
                <>
                    {/* Welcome & Profile Section */}
                    <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                {(user.email?.[0] || 'U').toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
                                <p className="text-muted-foreground">Here is your health overview.</p>
                                {!patientProfile && (
                                    <p className="text-red-500 text-sm mt-1 font-medium bg-red-50 p-1 rounded">
                                        ⚠ No patient record found. Please contact the clinic.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* My Details Card */}
                        {patientProfile && (
                            <Card className="min-w-[300px] bg-card/50 backdrop-blur">
                                <CardContent className="p-4 space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <User className="h-4 w-4" /> <span>{patientProfile.first_name} {patientProfile.last_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-4 w-4" /> <span>{patientProfile.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="h-4 w-4" /> <span>{patientProfile.address}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* 1. Appointments */}
                        <Card className="hover:shadow-md transition-shadow border-t-4 border-t-blue-500">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-blue-500" />
                                    Appointments
                                </CardTitle>
                                <CardDescription>Upcoming consultations</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {myAppointments.length > 0 ? (
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                                        {myAppointments.map(app => (
                                            <div key={app.id} className="p-3 bg-muted/50 rounded-lg text-sm border hover:bg-muted transition-colors">
                                                <div className="flex justify-between font-medium">
                                                    <span>{formatForDisplay(app.appointment_date)}</span>
                                                    <Badge variant="outline">Confirmed</Badge>
                                                </div>
                                                <p className="text-muted-foreground mt-1">{getDocName(app.doctor_id)}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 bg-muted/30 rounded-lg text-center border border-dashed">
                                        <p className="text-sm text-muted-foreground italic">No appointments scheduled.</p>
                                    </div>
                                )}

                                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="w-full" disabled={!patientProfile}>
                                            <Plus className="mr-2 h-4 w-4"/> Book New
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Book Appointment</DialogTitle>
                                            <DialogDescription>Choose a doctor and a date.</DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleBook} className="space-y-4 pt-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium">Doctor</label>
                                                <Select value={bookingData.doctor_id} onValueChange={(val) => setBookingData({...bookingData, doctor_id: val})}>
                                                    <SelectTrigger><SelectValue placeholder="Select Doctor" /></SelectTrigger>
                                                    <SelectContent>
                                                        {doctors.map(d => (
                                                            <SelectItem key={d.id} value={d.id.toString()}>Dr. {d.last_name} ({d.specialisation})</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium">Date</label>
                                                <Input type="date" value={bookingData.date} onChange={e => setBookingData({...bookingData, date: e.target.value})} required />
                                            </div>
                                            <Button type="submit" className="w-full">Confirm Booking</Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                        </Card>

                        {/* 2. Prescriptions */}
                        <Card className="hover:shadow-md transition-shadow border-t-4 border-t-purple-500">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Pill className="h-5 w-5 text-purple-500" />
                                    Prescriptions
                                </CardTitle>
                                <CardDescription>Current medication plan</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {myPrescriptions.length > 0 ? (
                                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                                        {myPrescriptions.map(p => (
                                            <div key={p.id} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg border">
                                                <div>
                                                    <p className="font-semibold text-sm">{p.medication}</p>
                                                    <p className="text-xs text-muted-foreground">{p.dosage}</p>
                                                </div>
                                                <Badge variant={new Date(p.end_date) > new Date() ? "default" : "secondary"}>
                                                    {new Date(p.end_date) > new Date() ? "Active" : "Expired"}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 bg-muted/30 rounded-lg text-center border border-dashed">
                                        <p className="text-sm text-muted-foreground italic">No prescriptions on record.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 3. Medical History */}
                        <Card className="hover:shadow-md transition-shadow border-t-4 border-t-orange-500">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-orange-500" />
                                    Medical History
                                </CardTitle>
                                <CardDescription>Diagnosis records</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {myDiagnoses.length > 0 ? (
                                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                                        {myDiagnoses.map(d => (
                                            <div key={d.id} className="p-3 bg-muted/50 rounded-lg border text-sm">
                                                <p className="font-semibold">{d.condition}</p>
                                                <p className="text-xs text-muted-foreground mt-1">Diagnosed: {formatForDisplay(d.diagnosis_date)}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 bg-muted/30 rounded-lg text-center border border-dashed">
                                        <p className="text-sm text-muted-foreground italic">No medical history recorded.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </main>
    </motion.div>
  );
}