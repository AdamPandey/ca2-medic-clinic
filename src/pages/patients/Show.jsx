import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/config/api";
import { formatForDisplay } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowLeft, Mail, Phone, MapPin, Calendar, Clock, Edit, Stethoscope } from "lucide-react";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { useLocation } from "react-router-dom";

export default function PatientShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]); // <--- New State
  const [loading, setLoading] = useState(true);
  const { setBreadcrumb } = useBreadcrumb();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Patient, Appointments, AND Doctors (to get names)
        const [patRes, appRes, docRes] = await Promise.all([
            api.get(`/patients/${id}`),
            api.get('/appointments'), // Fetching all to filter client-side is safer with this API
            api.get('/doctors')
        ]);

        setPatient(patRes.data);
        setDoctors(docRes.data);

        // Filter appointments for this patient
        const patientApps = appRes.data.filter(a => a.patient_id === parseInt(id));
        setAppointments(patientApps);
        if (patRes.data) {
            const name = `${patRes.data.first_name} ${patRes.data.last_name}`;
            setBreadcrumb(location.pathname, name);
        }

      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;
  if (!patient) return <div className="p-10 text-center">Patient not found</div>;

  const getFullName = (p) => {
    if (p.name) return p.name;
    return `${p.first_name || ''} ${p.last_name || ''}`.trim();
  };

  // Helper to find Doctor Name by ID
  const getDocName = (docId) => {
      const doc = doctors.find(d => d.id === docId);
      if (!doc) return `Doctor #${docId}`;
      return getFullName(doc);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/patients')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
            <h1 className="text-3xl font-bold text-foreground">{getFullName(patient)}</h1>
            <p className="text-slate-500">Patient ID: #{patient.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Personal Info Card */}
        <Card className="md:col-span-1 h-fit">
            <CardHeader className="bg-muted/0 border-b">
                <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="font-medium text-sm break-all">{patient.email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-green-500" />
                    <div>
                        <p className="text-xs text-slate-500">Phone</p>
                        <p className="font-medium text-sm">{patient.phone}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-red-500" />
                    <div>
                        <p className="text-xs text-slate-500">Address</p>
                        <p className="font-medium text-sm">{patient.address || "N/A"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    <div>
                        <p className="text-xs text-slate-500">Date of Birth</p>
                        <p className="font-medium text-sm">{formatForDisplay(patient.date_of_birth)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Tabs */}
        <div className="md:col-span-2">
            <Tabs defaultValue="appointments" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="appointments">Appointments</TabsTrigger>
                    <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                    <TabsTrigger value="diagnoses">Diagnoses</TabsTrigger>
                </TabsList>

                <TabsContent value="appointments" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Appointments</CardTitle>
                            <CardDescription>Scheduled visits for this patient.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {appointments.length === 0 ? (
                                <p className="text-slate-500 italic">No appointments found.</p>
                            ) : (
                                <div className="space-y-3">
                                    {appointments.map(app => (
                                        <div key={app.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-8 w-8 text-blue-200" />
                                                <div>
                                                    {/* FIX: Use appointment_date, not date */}
                                                    <p className="font-semibold text-sm">{formatForDisplay(app.appointment_date)}</p>
                                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                                        <Stethoscope className="h-3 w-3" />
                                                        {/* FIX: Show Name instead of ID */}
                                                        <span>{getDocName(app.doctor_id)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge variant="secondary">Scheduled</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="prescriptions">
                    <Card><CardContent className="pt-6"><p className="text-slate-500">No prescriptions found.</p></CardContent></Card>
                </TabsContent>
                <TabsContent value="diagnoses">
                    <Card><CardContent className="pt-6"><p className="text-slate-500">No diagnoses found.</p></CardContent></Card>
                </TabsContent>
            </Tabs>
        </div>
      </div>
    </div>
  );
}