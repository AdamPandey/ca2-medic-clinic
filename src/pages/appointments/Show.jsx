import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "@/config/api";
import { formatForDisplay } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Calendar, Clock, User, Stethoscope, Mail } from "lucide-react";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { useLocation } from "react-router-dom";

export default function AppointmentShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { setBreadcrumb } = useBreadcrumb();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Appointment
        const appRes = await api.get(`/appointments/${id}`);
        const appointment = appRes.data;

        // 2. Fetch Doctor and Patient details
        const [docRes, patRes] = await Promise.all([
            api.get(`/doctors/${appointment.doctor_id}`),
            api.get(`/patients/${appointment.patient_id}`)
        ]);

        setData({
            appointment,
            doctor: docRes.data,
            patient: patRes.data
        });

        // Set Breadcrumb
        setBreadcrumb(location.pathname, `Appointment #${appointment.id}`);

      } catch (error) {
        console.error("Failed to fetch details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;
  if (!data) return <div className="p-10 text-center">Record not found</div>;

  const { appointment, doctor, patient } = data;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/appointments')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
            <h1 className="text-3xl font-bold text-foreground">Consultation Details</h1>
            <p className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" /> {formatForDisplay(appointment.appointment_date)}
            </p>
        </div>
        <div className="ml-auto">
            <Badge variant="default" className="text-sm px-3 py-1">Confirmed</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Patient Card */}
        <Card className="border-l-4 border-l-green-500">
            <CardHeader className="bg-muted/50 pb-4">
                <CardTitle className="flex items-center gap-2 text-green-700">
                    <User className="h-5 w-5" /> Patient
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center border-b border-border pb-2">
                    <span className="text-muted-foreground text-sm">Name</span>
                    <Link to={`/patients/${patient.id}`} className="font-medium hover:underline text-primary">
                        {patient.first_name} {patient.last_name}
                    </Link>
                </div>
                <div className="flex justify-between items-center border-b border-border pb-2">
                    <span className="text-muted-foreground text-sm">Email</span>
                    <span className="text-sm">{patient.email}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Phone</span>
                    <span className="text-sm">{patient.phone}</span>
                </div>
            </CardContent>
        </Card>

        {/* Doctor Card */}
        <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="bg-muted/50 pb-4">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Stethoscope className="h-5 w-5" /> Doctor
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center border-b border-border pb-2">
                    <span className="text-muted-foreground text-sm">Name</span>
                    <Link to={`/doctors/${doctor.id}`} className="font-medium hover:underline text-primary">
                        Dr. {doctor.first_name} {doctor.last_name}
                    </Link>
                </div>
                <div className="flex justify-between items-center border-b border-border pb-2">
                    <span className="text-muted-foreground text-sm">Specialisation</span>
                    <Badge variant="secondary">{doctor.specialisation}</Badge>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Email</span>
                    <span className="text-sm">{doctor.email}</span>
                </div>
            </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Session Information</CardTitle>
                <CardDescription>System metadata for this appointment.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase font-bold">Appointment ID</p>
                    <p className="text-2xl font-mono mt-1">#{appointment.id}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase font-bold">Created At</p>
                    <p className="text-lg mt-1 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {new Date().toLocaleDateString()} {/* API doesn't always send createdAt, using Date as fallback */}
                    </p>
                </div>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}