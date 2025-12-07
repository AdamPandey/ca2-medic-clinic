import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/config/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowLeft, Mail, Phone, Calendar, BriefcaseMedical, User } from "lucide-react";
import { formatForDisplay } from "@/lib/utils";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { useLocation } from "react-router-dom";

export default function DoctorShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]); // <--- New State
  const [loading, setLoading] = useState(true);
  const { setBreadcrumb } = useBreadcrumb();
  const location = useLocation();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, appRes, patRes] = await Promise.all([
            api.get(`/doctors/${id}`),
            api.get(`/appointments`),
            api.get('/patients')
        ]);

        setDoctor(docRes.data);
        setPatients(patRes.data);

        // Filter appointments for this doctor
        const docApps = appRes.data.filter(a => a.doctor_id === parseInt(id));
        setAppointments(docApps);
        if (docRes.data) {
            const name = `${docRes.data.first_name} ${docRes.data.last_name}`;
            setBreadcrumb(location.pathname, name);
        }

      } catch (error) {
        console.error("Failed to fetch details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;
  if (!doctor) return <div className="p-10 text-center">Doctor not found</div>;

  const getFullName = (person) => {
    if (!person) return 'Unknown';
    if (person.name) return person.name;
    return `${person.first_name || ''} ${person.last_name || ''}`.trim();
  };

  const getPatName = (patId) => {
      const p = patients.find(pat => pat.id === patId);
      if (!p) return `Patient #${patId}`;
      return getFullName(p);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/doctors')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
            <h1 className="text-3xl font-bold text-foreground">{getFullName(doctor)}</h1>
            <p className="text-slate-500">{doctor.specialisation}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1 h-fit">
            <CardHeader className="bg-muted/50 border-b">
                <CardTitle>Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="font-medium text-sm">{doctor.email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-green-500" />
                    <div>
                        <p className="text-xs text-slate-500">Phone</p>
                        <p className="font-medium text-sm">{doctor.phone}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <BriefcaseMedical className="h-5 w-5 text-purple-500" />
                    <div>
                        <p className="text-xs text-slate-500">Specialisation</p>
                        <Badge variant="secondary" className="mt-1">{doctor.specialisation}</Badge>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Schedule Tab */}
        <div className="md:col-span-2">
            <Tabs defaultValue="schedule" className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="schedule" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Appointments</CardTitle>
                            <CardDescription>Scheduled consultations.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {appointments.length === 0 ? (
                                <p className="text-slate-500 italic">No appointments scheduled.</p>
                            ) : (
                                <div className="space-y-3">
                                    {appointments.map(app => (
                                        <div key={app.id} className="flex justify-between items-center p-3 border rounded hover:bg-muted/0 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-8 w-8 text-blue-200" />
                                                <div>
                                                    {/* FIX: Use appointment_date */}
                                                    <p className="font-semibold text-sm">{formatForDisplay(app.appointment_date)}</p>
                                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                                        <User className="h-3 w-3" />
                                                        {/* FIX: Show Patient Name */}
                                                        <span>{getPatName(app.patient_id)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge>Confirmed</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="history">
                     <Card><CardContent className="pt-6"><p className="text-slate-400">Past appointments would be listed here...</p></CardContent></Card>
                </TabsContent>
            </Tabs>
        </div>
      </div>
    </div>
  );
}